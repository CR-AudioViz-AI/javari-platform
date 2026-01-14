import { NextRequest, NextResponse } from 'next/server';
import { forecastEngine } from '@/orchestrator/analytics/forecast-engine';

export async function GET(request: NextRequest) {
  try {
    const forecast = await forecastEngine.generateForecast();
    return NextResponse.json(forecast);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
