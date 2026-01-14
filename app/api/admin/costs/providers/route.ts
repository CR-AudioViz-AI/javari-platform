import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsEngine } from '@/orchestrator/analytics/cost-engine';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const breakdown = await costAnalyticsEngine.getProviderBreakdown(thirtyDaysAgo, now);
    
    return NextResponse.json({ providers: breakdown, timestamp: now.toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
