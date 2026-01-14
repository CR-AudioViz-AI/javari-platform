import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        totalCreditsUsed: 0,
        totalCreditsAvailable: 0,
        activeUsers: 0,
      });
    }

    const client = db['supabase'];
    const { data: balances } = await client.from('credit_balances').select('*');
    
    const totalUsed = balances?.reduce((sum, b) => sum + parseFloat(b.credits_used || '0'), 0) || 0;
    const totalAvailable = balances?.reduce((sum, b) => sum + parseFloat(b.credits_available || '0'), 0) || 0;

    return NextResponse.json({
      totalCreditsUsed: totalUsed,
      totalCreditsAvailable: totalAvailable,
      activeUsers: balances?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
