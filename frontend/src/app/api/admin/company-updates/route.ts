import { NextResponse, type NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { getDB } from '@/lib/server/db';
import { companyUpdates, users } from '@/lib/server/schema';
import { getCurrentUser } from '@/lib/server/auth';

/**
 * GET /api/admin/company-updates
 * Retrieves a list of company updates, optionally filtered by status.
 * Requires admin privileges.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  try {
    const db = await getDB();
    
    // Base query - Fetch all updates matching the join.
    // TODO: Optimize: Filter and Order by status/date at the database level if performance becomes an issue.
    let queryBuilder = db
      .select() // Select all columns from both tables
      .from(companyUpdates)
      .leftJoin(users, eq(companyUpdates.requesterUserId, users.id));
          
    // Execute the query
    let allUpdates = await queryBuilder;

    // Filter in code if statusFilter is provided
    const filteredUpdates = statusFilter
      // Access nested property: update.company_updates.status
      ? allUpdates.filter(update => update.company_updates.status === statusFilter) 
      : allUpdates;

    // Sort in code (descending by createdAt)
    const sortedUpdates = filteredUpdates.sort((a, b) => 
      b.company_updates.createdAt.getTime() - a.company_updates.createdAt.getTime()
    );

    // Map to desired output structure (optional, but good practice)
    const responseData = sortedUpdates.map(update => ({
        updateId: update.company_updates.id,
        companyId: update.company_updates.companyId,
        status: update.company_updates.status,
        createdAt: update.company_updates.createdAt,
        requesterEmail: update.users?.email, // Handle potential null if user deleted
        fetchedData: update.company_updates.fetchedData,
    }));

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching company updates:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 