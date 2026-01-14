import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsEngine } from '@/orchestrator/analytics/cost-engine';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [daily, weekly, monthly, hourlyBurn, cacheSavings] = await Promise.all([
      costAnalyticsEngine.getTotalSpend(oneDayAgo, now),
      costAnalyticsEngine.getTotalSpend(sevenDaysAgo, now),
      costAnalyticsEngine.getTotalSpend(thirtyDaysAgo, now),
      costAnalyticsEngine.getHourlyBurnRate(),
      costAnalyticsEngine.getCacheSavings(sevenDaysAgo, now),
    ]);

    return NextResponse.json({
      daily, weekly, monthly, hourlyBurnRate: hourlyBurn, cacheSavings,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
