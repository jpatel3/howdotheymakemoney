import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getDB } from '@/lib/server/db';
import { companyRequests } from '@/lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { UserSession, getCurrentUser } from '@/lib/server/auth';
import { processCompanyRequestJob } from '@/lib/server/request-processor';

// Secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' 
);

// Define expected statuses
type RequestStatus = 'approved' | 'rejected' | 'pending' | 'processing';

/**
 * PATCH /api/admin/company-requests/[requestId]
 * Approves a company request by setting its status to 'processing' 
 * and queueing a background job (simulated via setTimeout) to fetch company data.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  // 1. Verify Admin Authentication
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }
  const adminUser = currentUser;

  // 2. Get Request ID from URL
  const requestIdStr = params.requestId;
  const requestId = parseInt(requestIdStr, 10);

  if (isNaN(requestId)) {
    return NextResponse.json({ error: 'Bad Request: Invalid request ID format' }, { status: 400 });
  }

  // 3. Update Request Status to 'processing' and Trigger Background Job (Simulation)
  try {
    const db = await getDB();
    if (!db) {
      console.error('Admin Request Approval API error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Find the request first to ensure it exists and is pending
    const requestToProcess = await db
      .select({ id: companyRequests.id, status: companyRequests.status })
      .from(companyRequests)
      .where(eq(companyRequests.id, requestId))
      .limit(1)
      .get();

    if (!requestToProcess) {
      return NextResponse.json({ error: 'Not Found: Request not found' }, { status: 404 });
    }

    if (requestToProcess.status !== 'pending') {
      return NextResponse.json({ error: `Conflict: Request status is already ${requestToProcess.status}` }, { status: 409 });
    }

    // Update status to processing
    const updateResult = await db
      .update(companyRequests)
      .set({ status: 'processing' })
      .where(eq(companyRequests.id, requestId))
      .returning({ updatedId: companyRequests.id });
      
    if (updateResult.length === 0) {
       console.error(`Failed to update request ${requestId} status to processing.`);
       return NextResponse.json({ error: 'Internal Server Error: Failed to update request status' }, { status: 500 });
    }

    // --- Background Job Simulation --- 
    console.log(`Queueing background job for request ID: ${requestId}`);
    setTimeout(() => {
      processCompanyRequestJob(requestId).catch((err: Error | unknown) => {
        console.error(
          `Background job failed for request ID ${requestId}:`, 
          err instanceof Error ? err.message : String(err)
        );
      });
    }, 0); 
    // ----------------------------------
    
    // 4. Return Accepted Response
    console.log(`Admin ${adminUser.email} initiated processing for request ${requestId}.`);
    return NextResponse.json({ success: true, message: 'Request accepted for processing' }, { status: 202 }); 

  } catch (error) {
    console.error(`Error approving company request ${requestId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error: Could not approve request' }, { status: 500 });
  }
}

// --- Optional: Add GET/DELETE handlers if needed for this specific route --- 