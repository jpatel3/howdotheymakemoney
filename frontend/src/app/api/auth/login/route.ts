import { NextResponse } from 'next/server';
import { loginUser, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt to log in the user using the function from lib/auth
    const { token, user } = await loginUser(email, password);

    // If loginUser didn't throw an error, login was successful
    const response = NextResponse.json(
        { success: true, user: user }, // Return user info on success
        { status: 200 }
    );

    // Set the session cookie using the function from lib/auth
    // Note: setSessionCookie uses cookies() from next/headers, which only works
    // in Server Components or Route Handlers that read cookies first.
    // We might need to set the cookie directly on the response object here.
    
    // Direct cookie setting on NextResponse
    response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'strict',
    });

    return response;

  } catch (error) {
    // Handle errors thrown by loginUser (e.g., invalid credentials)
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 } // Unauthorized
      );
    } 
    // Handle potential database connection errors from loginUser
    else if (error instanceof Error && error.message.includes('Database connection error')) {
        console.error('Login API DB error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error during login' }, 
            { status: 500 }
        );
    }
    // Handle other unexpected errors
    else {
        console.error('Login API general error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' }, 
            { status: 500 }
        );
    }
  }
} 