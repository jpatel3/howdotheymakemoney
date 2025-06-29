import { NextResponse, type NextRequest } from "next/server";
// import { auth } from "@/lib/server/auth";
// import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { getDB } from "@/lib/server/db";
import { companies } from "@/lib/server/schema";
import { eq } from "drizzle-orm";
// import { isAdmin } from "@/lib/utils"; // isAdmin check is done on session payload
// import { triggerCompanyUpdate } from "@/lib/jobs/company-update-processor"; // TODO: Implement this
import { triggerCompanyUpdate } from '@/lib/server/jobs/company-updater'; 

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getCurrentUser();
  if (!session?.id || !session.isAdmin) { // Combine checks and ensure isAdmin
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Read context from request body
  let contextText: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.context === 'string' && body.context.trim().length > 0) {
      contextText = body.context;
    } else {
        // If context is missing or empty, return an error or proceed without context?
        // For manual injection, let's require it.
        return NextResponse.json({ error: "'context' field with text content is required in request body" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const { slug } = params;
  if (!slug) {
    return NextResponse.json(
      { error: "Company slug is required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDB();

    // 1. Find the company by slug
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, slug),
      columns: {
        id: true,
        name: true, 
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 2. Trigger the background update process (DO NOT await this)
    // We trigger it asynchronously and return 202 immediately.
    triggerCompanyUpdate(company.id, company.name, session.id, contextText)
      .catch(err => {
        // Log the error if the async function fails after we've responded
        console.error(`Background update failed for company ${slug} (ID: ${company.id}):`, err);
      });

    // 3. Return 202 Accepted
    return NextResponse.json(
      { message: "Company data refresh process initiated." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`Error initiating refresh API call for company ${slug}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: Could not initiate refresh. ${errorMessage}` },
      { status: 500 }
    );
  }
} 