import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getCurrentUser } from '@/lib/server/auth'; // Updated path
import { UserSession } from '@/lib/server/auth'; // Updated path

// Secret key (should match middleware/auth.ts/signup)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' // Ensure this matches!
);

export async function GET(request: Request) {
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Validate payload structure before casting
    if (
        typeof payload.id !== 'number' || 
        typeof payload.email !== 'string' || 
        typeof payload.name !== 'string' || // Assuming name is now required
        typeof payload.isAdmin !== 'boolean'
    ) {
        console.error('Auth /me error: Invalid JWT payload structure:', payload);
        throw new Error('Invalid token payload structure');
    }
    
    // Token is valid, return user payload matching UserSession
    return NextResponse.json({ success: true, user: payload as UserSession });

  } catch (error) {
    console.error('Auth /me error:', error);
    // Token is invalid or expired
    // Clear the invalid cookie? Optional, but can prevent repeated failed checks.
    const response = NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    response.cookies.set({
        name: 'token', value: '', httpOnly: true, path: '/',
        secure: process.env.NODE_ENV === 'production', maxAge: 0, sameSite: 'strict',
    });
    return response;
  }
} 