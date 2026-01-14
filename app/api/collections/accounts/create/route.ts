import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client_id,
      debtor_name,
      balance,
      state,
      original_creditor,
    } = body;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const client = db['supabase'];
    const { data, error } = await client
      .from('accounts')
      .insert({
        client_id,
        debtor_name,
        balance,
        state,
        original_creditor,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, account: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
