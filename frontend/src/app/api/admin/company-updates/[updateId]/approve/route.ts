import { NextResponse, type NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDB, type DbClient } from '@/lib/server/db'; // Import DbClient type
import { companyUpdates, companies } from '@/lib/server/schema';
import { getCurrentUser } from '@/lib/server/auth';

/**
 * Approves a company update, updating the main companies table 
 * and the companyUpdates status.
 * 
 * @param db The Drizzle database client.
 * @param updateId The ID of the company update record.
 * @param reviewerUserId The ID of the admin approving the update.
 * @returns True if successful, false otherwise.
 */
async function approveUpdate(db: DbClient, updateId: number, reviewerUserId: number): Promise<boolean> {
  try {
    // Start transaction
    await db.transaction(async (tx) => {
      // 1. Fetch the update data and lock the row (if supported, otherwise just fetch)
      // Use .get() for SQLite/D1 compatibility to fetch a single row
      const updateRecord = await tx
        .select()
        .from(companyUpdates)
        .where(eq(companyUpdates.id, updateId))
        .limit(1)
        .get(); // Use .get() to fetch the single record

      if (!updateRecord || updateRecord.status !== 'pending_review') {
        console.warn(`Approve failed: Update ID ${updateId} not found or not pending review.`);
        throw new Error('Update not found or not pending review'); // Abort transaction
      }

      // 2. Parse the fetched data
      const fetchedData = JSON.parse(updateRecord.fetchedData);

      // 3. Update the corresponding companies table entry
      // Only update fields that are present in fetchedData 
      const updatePayload: Partial<typeof companies.$inferInsert> = {};
      if (fetchedData.description !== undefined) updatePayload.description = fetchedData.description;
      if (fetchedData.website !== undefined) updatePayload.website = fetchedData.website;
      if (fetchedData.headquarters !== undefined) updatePayload.headquarters = fetchedData.headquarters;
      if (fetchedData.primaryRevenue !== undefined) updatePayload.primaryRevenue = fetchedData.primaryRevenue;
      if (fetchedData.revenueBreakdown !== undefined) updatePayload.revenueBreakdown = fetchedData.revenueBreakdown;
      if (fetchedData.businessModel !== undefined) updatePayload.businessModel = fetchedData.businessModel;
      // Add other fields as needed based on FetchedCompanyData interface

      if (Object.keys(updatePayload).length > 0) {
          await tx
            .update(companies)
            .set(updatePayload)
            .where(eq(companies.id, updateRecord.companyId));
      }

      // 4. Update the companyUpdates status
      await tx
        .update(companyUpdates)
        .set({
          status: 'approved',
          reviewerUserId: reviewerUserId,
          reviewedAt: sql`(unixepoch())`, // Use Drizzle SQL for current timestamp
        })
        .where(eq(companyUpdates.id, updateId));
      
      console.log(`Company update ${updateId} approved by user ${reviewerUserId}. Company ${updateRecord.companyId} updated.`);
    }); // Transaction commits here if no errors
    return true;
  } catch (error) {
    console.error(`Error approving company update ${updateId}:`, error);
    // Transaction automatically rolls back on error
    return false;
  }
}

/**
 * POST /api/admin/company-updates/[updateId]/approve
 * API route handler to approve a company update.
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
    const success = await approveUpdate(db, updateId, session.id);

    if (success) {
      return NextResponse.json({ message: 'Update approved successfully' });
    } else {
      // Specific error might already be logged in approveUpdate
      return NextResponse.json({ error: 'Failed to approve update' }, { status: 500 });
    }
  } catch (error) {
    console.error("API error approving update:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 