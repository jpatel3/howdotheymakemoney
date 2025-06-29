import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getDB } from './db'; // Correct path
import { users } from './schema'; // Correct path
import { eq } from 'drizzle-orm';
import { D1Database } from '@cloudflare/workers-types';

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Define the structure of our user session data within the JWT
// Include all necessary fields for frontend/middleware checks
export interface UserSession extends JWTPayload {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

// Login user function
export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: UserSession }> {
  // Explicitly handle DB binding check here to satisfy linter
  let dbBinding: D1Database | undefined = undefined; 
  // How to get the actual binding here depends on the execution context 
  // (e.g., from request object in Cloudflare Workers). 
  // For local dev, we will pass undefined to getDB.
  const db = await getDB(dbBinding); 

  if (!db) throw new Error('Database connection error during login');
  
  // Find user by email, select correct password field
  const user = await db.select({
      id: users.id,
      email: users.email,
      password: users.password, // Use the actual password field name from schema
      name: users.name,
      isAdmin: users.isAdmin
  }).from(users).where(eq(users.email, email.toLowerCase())).limit(1).get();
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Compare with the fetched password field
  const isMatch = await bcrypt.compare(password, user.password); 
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Construct the session payload
  const session: UserSession = {
    id: user.id,
    email: user.email,
    name: user.name, 
    isAdmin: user.isAdmin,
  };
  
  // Create and sign JWT
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return { token, user: session };
}

// Set session cookie (using 'token' name)
export function setSessionCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
  });
}

// Clear session cookie (using 'token' name)
export function clearSessionCookie() {
  cookies().set('token', '', { 
      httpOnly: true, path: '/', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 0, sameSite: 'strict' 
  });
}

// Get current user session (validates and returns UserSession)
export async function getCurrentUser(): Promise<UserSession | null> {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Basic validation of expected fields
    if (
        typeof payload.id !== 'number' || 
        typeof payload.email !== 'string' || 
        typeof payload.name !== 'string' ||
        typeof payload.isAdmin !== 'boolean'
    ) {
      console.error('Invalid JWT payload structure in getCurrentUser:', payload);
      return null;
    }
    return payload as UserSession;
  } catch (error) {
    // Log specific JWT errors like expiration, signature mismatch etc.
    console.warn(`JWT verification failed in getCurrentUser: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

// Helper to require authentication (returns UserSession or throws)
export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    // In API routes, throwing might be okay, in pages consider redirect
    throw new Error('Authentication required'); 
  }
  return user;
} 