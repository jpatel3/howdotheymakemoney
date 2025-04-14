import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, users, userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Email notification types
export type NotificationType = 'new_company' | 'comment_reply' | 'company_request_approved';

export async function POST(request: NextRequest) {
  try {
    // This endpoint would typically be called by a background worker
    // For security, we'll require an API key in production
    const apiKey = request.headers.get('x-api-key');
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { type, userId, data } = await request.json();
    
    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Notification type and user ID are required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Get user and profile
    const user = await dbClient
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();
      
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const profile = await dbClient
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();
      
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Check notification preferences
    const preferences = JSON.parse(profile.notificationPreferences as string);
    
    // Skip if user has opted out of this notification type
    if (type === 'new_company' && !preferences.email_new_companies) {
      return NextResponse.json({
        success: true,
        message: 'User opted out of this notification type',
        sent: false
      });
    }
    
    if (type === 'site_update' && !preferences.email_site_updates) {
      return NextResponse.json({
        success: true,
        message: 'User opted out of this notification type',
        sent: false
      });
    }
    
    // In a real implementation, this would send an email via a service like SendGrid
    // For now, we'll just log the notification
    console.log(`Sending ${type} notification to ${user.email}`, data);
    
    // In production, you would integrate with an email service here
    // Example with SendGrid:
    // await sendEmail({
    //   to: user.email,
    //   subject: getSubjectForNotificationType(type, data),
    //   html: getTemplateForNotificationType(type, data)
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      sent: true
    });
  } catch (error) {
    console.error('Send notification error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while sending notification' },
      { status: 500 }
    );
  }
}
