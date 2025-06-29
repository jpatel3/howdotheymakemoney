import { NextResponse, type NextRequest } from 'next/server';
import { getDB } from '@/lib/server/db';
import { users } from '@/lib/server/schema';
import { getCurrentUser } from '@/lib/server/auth';
import { desc } from 'drizzle-orm';

/**
 * GET /api/admin/users
 * Retrieves a list of all users.
 * Requires admin privileges.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = await getDB();
    
    // Fetch all users, excluding the password field
    // TODO: Optimize: Order by date at the database level if possible later
    const allUsersData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);
      // Remove orderBy from here

    // Sort in code (descending by createdAt)
    // Ensure createdAt is treated as a Date object for correct sorting
    const sortedUsers = allUsersData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA; 
    });

    return NextResponse.json(sortedUsers);

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 