import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, companyRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Secret key (should match middleware/auth.ts/etc)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' 
);

// Interface for expected user payload in JWT
interface UserJWTPayload {
  id: number;
  email: string;
  name?: string;
  role?: string;
  // Add other fields if they exist in your JWT payload
}

export async function POST(request: Request) {
  // 1. Verify User Authentication
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let userId: number;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Safely access payload properties
    if (typeof payload.id !== 'number') { 
        console.error('Invalid token payload: Missing or invalid user ID', payload);
        throw new Error('Invalid token payload');
    }
    userId = payload.id;
  } catch (error) {
    console.error('Auth error during company request:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }

  // 2. Parse Request Body
  let companyName: string;
  try {
    const body = await request.json();
    companyName = body.companyName;
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json({ error: 'Bad Request: companyName is required and must be a non-empty string' }, { status: 400 });
    }
    companyName = companyName.trim(); // Trim whitespace
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Bad Request: Invalid JSON body' }, { status: 400 });
  }

  // 3. Save to Database
  try {
    const db = await getDB(undefined); 
    if (!db) {
      console.error('Company Request API error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    await db.insert(companyRequests).values({
      userId: userId, 
      companyName: companyName,
      status: 'pending',
    });

    // 4. Return Success Response
    return NextResponse.json({ success: true, message: 'Company request submitted successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error saving company request:', error);
    return NextResponse.json({ error: 'Internal Server Error: Could not save request' }, { status: 500 });
  }
}
