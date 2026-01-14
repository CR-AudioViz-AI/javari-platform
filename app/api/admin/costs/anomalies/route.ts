import { NextRequest, NextResponse } from 'next/server';
import { costAlertsSystem } from '@/orchestrator/analytics/cost-alerts';

export async function GET(request: NextRequest) {
  try {
    const alerts = await costAlertsSystem.getUnresolvedAlerts(100);
    return NextResponse.json({ alerts, total: alerts.length, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
