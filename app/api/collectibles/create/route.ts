import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      owner_user_id,
      category_id,
      name,
      brand,
      year,
      condition,
      attributes,
    } = body;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const client = db['supabase'];
    
    // Create collectible
    const { data: collectible, error: collectibleError } = await client
      .from('collectibles')
      .insert({
        owner_user_id,
        category_id,
        name,
        brand,
        year,
        condition,
        status: 'owned',
      })
      .select()
      .single();

    if (collectibleError) throw collectibleError;

    // Create attributes if provided
    if (attributes && Object.keys(attributes).length > 0) {
      const { error: attrError } = await client
        .from('collectible_attributes')
        .insert({
          collectible_id: collectible.id,
          data: attributes,
        });

      if (attrError) throw attrError;
    }

    return NextResponse.json({ success: true, collectible });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
