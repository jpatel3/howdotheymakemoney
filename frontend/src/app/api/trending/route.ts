import { NextRequest, NextResponse } from 'next/server';
import { getDB, votes } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Get trending companies based on votes
    const results = await dbClient.execute(`
      SELECT 
        company_id,
        SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes,
        COUNT(*) as total_votes,
        SUM(CASE WHEN vote_type = 'upvote' THEN 1 WHEN vote_type = 'downvote' THEN -1 ELSE 0 END) as score
      FROM votes
      GROUP BY company_id
      ORDER BY score DESC, total_votes DESC
      LIMIT ?
    `, [limit]);
    
    return NextResponse.json({
      success: true,
      trending: results.results
    });
  } catch (error) {
    console.error('Get trending error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving trending companies' },
      { status: 500 }
    );
  }
}
