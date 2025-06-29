import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/server/db';
import { companyRequests } from '@/lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Secret key (should match middleware/auth.ts/etc)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Interface for expected user payload in JWT
interface UserJWTPayload {
  id: number;
  // ... other fields if needed ...
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  // 1. Verify User Authentication & Get User ID
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let userId: number;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.id !== 'number') {
      console.error('Invalid token payload in DELETE /company-requests: Missing or invalid user ID', payload);
      throw new Error('Invalid token payload');
    }
    userId = payload.id;
  } catch (error) {
    console.error('Auth error during DELETE /company-requests:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }

  // 2. Get Request ID from URL
  const requestIdStr = params.requestId;
  const requestId = parseInt(requestIdStr, 10);

  if (isNaN(requestId)) {
    return NextResponse.json({ error: 'Bad Request: Invalid request ID format' }, { status: 400 });
  }

  // 3. Delete from Database (Verify Ownership)
  try {
    const db = await getDB();
    if (!db) {
      console.error('Company Request API (DELETE) error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Delete the request ONLY IF the ID matches AND the userId matches
    const deleteResult = await db
      .delete(companyRequests)
      .where(
        and(
          eq(companyRequests.id, requestId),
          eq(companyRequests.userId, userId) // Crucial ownership check
        )
      )
      .returning({ deletedId: companyRequests.id }); // Check if something was actually deleted

    // Check if a row was actually deleted (meaning ID and owner matched)
    if (deleteResult.length === 0) {
      // Could be because the request doesn't exist OR the user doesn't own it
      // For security, often better to return 404 in both cases unless specific feedback is needed
      console.log(`Attempt to delete request ${requestId} by user ${userId} failed (not found or not owner).`);
      return NextResponse.json({ error: 'Not Found or Forbidden' }, { status: 404 });
    }
    
    // 4. Return Success Response (No Content)
    console.log(`Successfully deleted request ${requestId} by user ${userId}.`);
    return NextResponse.json({}, { status: 204 }); // Use NextResponse.json with empty body

  } catch (error) {
    console.error(`Error deleting company request ${requestId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error: Could not delete request' }, { status: 500 });
  }
} 