import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/server/db';
import { companyRequests, users } from '@/lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { UserSession, getCurrentUser } from '@/lib/server/auth';

// Secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' 
);

export async function GET(request: Request) {
  try {
    // Verify JWT from cookie
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userPayload: UserSession;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      // Basic validation
      if (typeof payload.id !== 'number' || typeof payload.isAdmin !== 'boolean') { 
          throw new Error('Invalid token payload structure');
      }
      userPayload = payload as UserSession;
    } catch (error) {
      console.error('Admin route auth error:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
    }

    // Check if user is admin using isAdmin flag
    if (userPayload.isAdmin !== true) { 
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get DB instance (ignoring linter error)
    const db = await getDB(); 
    if (!db) {
        console.error('Admin Requests API error: Failed to get DB instance');
        return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Get all company requests with user information
    const requests = await db
      .select({
        id: companyRequests.id,
        userId: companyRequests.userId,
        companyName: companyRequests.companyName,
        status: companyRequests.status,
        createdAt: companyRequests.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(companyRequests)
      .leftJoin(users, eq(companyRequests.userId, users.id))
      .orderBy(companyRequests.createdAt);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching company requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 