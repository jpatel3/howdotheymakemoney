import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getDB } from '@/lib/db';
import { companyRequests } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { UserSession } from '@/lib/auth'; 

// Secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' 
);

// Define expected statuses
type RequestStatus = 'approved' | 'rejected';

// PATCH handler to update request status
export async function PATCH(request: Request, { params }: { params: { requestId: string } }) {
  const requestId = parseInt(params.requestId, 10);
  if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
  }

  // 1. Verify Admin Auth
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if ((payload as UserSession).isAdmin !== true) {
        throw new Error('Forbidden');
    }
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 401;
    console.error('Admin request action auth error:', error);
    return NextResponse.json({ error: status === 403 ? 'Forbidden' : 'Unauthorized' }, { status });
  }

  // 2. Parse new status from body
  let newStatus: RequestStatus;
  try {
    const body = await request.json();
    newStatus = body.status;
    if (newStatus !== 'approved' && newStatus !== 'rejected') {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 3. Update Database
  try {
    const db = await getDB();
    if (!db) {
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // --- Get the original requester's userId BEFORE updating --- 
    const originalRequest = await db.select({ 
        userId: companyRequests.userId,
        companyName: companyRequests.companyName // Fetch name for logging/potential use
    })
    .from(companyRequests)
    .where(eq(companyRequests.id, requestId))
    .limit(1)
    .get();

    if (!originalRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const originalRequesterId = originalRequest.userId;
    // --- End Get userId ---

    // Now update the status
    const updateResult = await db.update(companyRequests)
      .set({ status: newStatus })
      .where(eq(companyRequests.id, requestId))
      .returning({ updatedId: companyRequests.id });
      
    // No need to check updateResult length again as we found the request above

    // --- TODO: Trigger next step upon approval --- 
    if (newStatus === 'approved') {
        console.log(`Request ID ${requestId} for company "${originalRequest.companyName}" by user ID ${originalRequesterId} approved. Triggering process...`);
        // Pass originalRequesterId to the next step (agent/manual creation)
    }
    // --- End TODO ---

    return NextResponse.json({ success: true, message: `Request status updated to ${newStatus}` });

  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 