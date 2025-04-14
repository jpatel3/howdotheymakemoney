import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Get user profile
    const profile = await dbClient
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .get();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        notificationPreferences: JSON.parse(profile.notificationPreferences as string)
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get request body
    const { displayName, bio, avatarUrl, notificationPreferences } = await request.json();
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Update user profile
    await dbClient
      .update(userProfiles)
      .set({
        displayName,
        bio,
        avatarUrl,
        notificationPreferences: notificationPreferences ? JSON.stringify(notificationPreferences) : undefined,
        updatedAt: new Date().toISOString()
      })
      .where(eq(userProfiles.userId, user.id));
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
