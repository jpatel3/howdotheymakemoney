import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getDB, users, userProfiles } from './db/schema';

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'howdotheymakemoney-default-secret-key'
);

// User session type
export interface UserSession {
  id: number;
  email: string;
  displayName?: string;
}

// Register a new user
export async function registerUser(
  db: D1Database,
  email: string,
  password: string,
  displayName?: string
) {
  const dbClient = getDB(db);
  
  // Check if user already exists
  const existingUser = await dbClient.select().from(users).where(users.email, '=', email).get();
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  // Create user in transaction
  return await dbClient.transaction(async (tx) => {
    // Insert user
    const result = await tx.insert(users).values({
      email,
      passwordHash,
    }).returning({ id: users.id });
    
    const userId = result[0].id;
    
    // Create user profile
    await tx.insert(userProfiles).values({
      userId,
      displayName: displayName || email.split('@')[0],
    });
    
    // Increment registered users counter
    await tx.execute(
      `UPDATE counters SET value = value + 1 WHERE name = 'registered_users'`
    );
    
    return userId;
  });
}

// Login user
export async function loginUser(
  db: D1Database,
  email: string,
  password: string
) {
  const dbClient = getDB(db);
  
  // Find user
  const user = await dbClient.select().from(users).where(users.email, '=', email).get();
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Update last login
  await dbClient.update(users)
    .set({ lastLogin: new Date().toISOString() })
    .where(users.id, '=', user.id);
  
  // Get user profile
  const profile = await dbClient.select()
    .from(userProfiles)
    .where(userProfiles.userId, '=', user.id)
    .get();
  
  // Create session
  const session: UserSession = {
    id: user.id,
    email: user.email,
    displayName: profile?.displayName
  };
  
  // Create and sign JWT
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return { token, user: session };
}

// Set session cookie
export function setSessionCookie(token: string) {
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
  });
}

// Clear session cookie
export function clearSessionCookie() {
  cookies().set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    sameSite: 'strict',
  });
}

// Get current user session
export async function getCurrentUser(): Promise<UserSession | null> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as UserSession;
  } catch (error) {
    return null;
  }
}

// Middleware to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
