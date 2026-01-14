import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, owner_user_id, visibility = 'private' } = body;

    if (!name || !owner_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const client = db['supabase'];
    if (!client) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    // Create community
    const { data: community, error: communityError } = await client
      .from('communities')
      .insert({
        name,
        description,
        owner_user_id,
        visibility,
      })
      .select()
      .single();

    if (communityError) throw communityError;

    // Add owner as member
    await client.from('community_members').insert({
      community_id: community.id,
      user_id: owner_user_id,
      role: 'owner',
    });

    // Log activity
    await client.from('activity_log').insert({
      community_id: community.id,
      user_id: owner_user_id,
      action: 'community_created',
      metadata: { name },
    });

    return NextResponse.json({
      success: true,
      community,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
