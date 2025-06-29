import { NextResponse, type NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDB } from '@/lib/server/db'; 
import { companyUpdates } from '@/lib/server/schema';
import { getCurrentUser } from '@/lib/server/auth';

/**
 * POST /api/admin/company-updates/[updateId]/reject
 * API route handler to reject a company update.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { updateId: string } }
) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updateId = parseInt(params.updateId, 10);
  if (isNaN(updateId)) {
    return NextResponse.json({ error: 'Invalid update ID' }, { status: 400 });
  }

  try {
    const db = await getDB();

    // 1. Find the update record by its unique ID
    const updateRecords = await db
      .select({ id: companyUpdates.id, status: companyUpdates.status })
      .from(companyUpdates)
      .where(eq(companyUpdates.id, updateId));

    if (updateRecords.length === 0) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    const updateRecord = updateRecords[0];

    if (updateRecord.status !== 'pending_review') {
      return NextResponse.json({ error: `Update is already ${updateRecord.status}` }, { status: 409 }); // Conflict
    }

    // 2. Update the status to 'rejected'
    await db
      .update(companyUpdates)
      .set({
        status: 'rejected',
        reviewerUserId: session.id,
        reviewedAt: sql`(unixepoch())`, // Use Drizzle SQL for current timestamp
      })
      .where(eq(companyUpdates.id, updateId));

    console.log(`Company update ${updateId} rejected by user ${session.id}.`);
    return NextResponse.json({ message: 'Update rejected successfully' });

  } catch (error) {
    console.error(`API error rejecting update ${updateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 