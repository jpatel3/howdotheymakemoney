import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Clear the session cookie
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Ensure cookie options match the ones used for setting it (name, path, secure, httpOnly, sameSite)
    response.cookies.set({
        name: 'token', // Match the cookie name used in middleware/signup
        value: '', // Set value to empty
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // Expire the cookie immediately
        sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error during logout' }, { status: 500 });
  }
} 