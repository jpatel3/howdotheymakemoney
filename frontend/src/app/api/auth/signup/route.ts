import { NextResponse } from 'next/server';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { getDB } from '@/lib/db';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Secret key (should match middleware/auth.ts)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key' // Ensure this matches!
);

// Remove edge runtime since we're using SQLite locally
// export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get the database instance (now requires await)
    const db = await getDB();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
      .get();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user with isAdmin: false
    const newUserResult = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: false, // Default to non-admin
    }).returning();

    if (!newUserResult || newUserResult.length === 0) {
      console.error('Signup error: Failed to create user in DB');
      return NextResponse.json(
        { error: 'Failed to create user account.' },
        { status: 500 }
      );
    }

    const newUser = newUserResult[0];

    // Create Session Payload including isAdmin
    const session = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name, 
      isAdmin: newUser.isAdmin // Include isAdmin flag
    };

    const token = await new SignJWT(session)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // --- Set Cookie --- 
    const response = NextResponse.json(
      { success: true, message: 'User created successfully' }, 
      { status: 201 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'strict',
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 