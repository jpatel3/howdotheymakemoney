import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth'; 
import { getDB } from '@/lib/server/db';
import { companies } from '@/lib/server/schema';
import { eq } from 'drizzle-orm';

/**
 * DELETE /api/admin/companies/[slug]
 * Allows an admin to delete a company.
 * TODO: Consider cascade deletion or handling of related bookmarks/comments.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the user is an admin directly via session
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const slug = params.slug;
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    const db = await getDB();

    // Find the company first to ensure it exists
    const companiesToDelete = await db 
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.slug, slug)); 

    if (companiesToDelete.length === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // If multiple found (shouldn't happen with unique slug), log warning? For now, proceed.
    const companyIdToDelete = companiesToDelete[0].id; 

    // Delete the company
    // Note: This assumes cascading deletes are set up in the DB for related data (bookmarks, comments),
    // or that related data should be manually deleted here if necessary.
    await db.delete(companies).where(eq(companies.slug, slug));

    console.log(`Admin ${session.id} deleted company with slug: ${slug} (ID: ${companyIdToDelete})`);
    // Return 204 No Content on successful deletion
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting company with slug ${slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}