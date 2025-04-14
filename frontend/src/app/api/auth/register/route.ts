import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setSessionCookie, loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    
    // Register user
    const userId = await registerUser(db, email, password, displayName);
    
    // Login the user automatically after registration
    const { token, user } = await loginUser(db, email, password);
    
    // Set session cookie
    setSessionCookie(token);
    
    // Return user data
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 409 }
        );
      }
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
