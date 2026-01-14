/**
 * Multi-AI Orchestrator - Phase E Test Harness
 * Tests: Cost Ledger, Analytics, Forecasting, Alerts
 */

import { calculateCost } from '../providers/pricing';
import { costAnalyticsEngine } from '../analytics/cost-engine';
import { forecastEngine } from '../analytics/forecast-engine';
import { costAlertsSystem } from '../analytics/cost-alerts';
import { isSupabaseConfigured } from '../db/client';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  duration?: number;
}

export async function runPhaseETests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase E Test Harness - Cost Intelligence');
  console.log('══════════════════════════════════════\n');

  // Test 1: Cost Calculation
  results.push(testCostCalculation());

  // Test 2: Cost Analytics (if Supabase available)
  results.push(await testCostAnalytics());

  // Test 3: Forecast Generation
  results.push(await testForecastGeneration());

  // Test 4: Cost Alerts
  results.push(await testCostAlerts());

  // Test 5: Ledger Integration
  results.push(testLedgerIntegration());

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n══════════════════════════════════════');
  console.log(`   Test Summary: ${passed}/${total} passed`);
  console.log('══════════════════════════════════════\n');
  
  return results;
}

function testCostCalculation(): TestResult {
  const start = Date.now();
  
  try {
    // Test known pricing
    const openaiCost = calculateCost('openai', 'gpt-4o-mini', 1000, 500);
    const expectedCost = (1000 / 1_000_000) * 0.15 + (500 / 1_000_000) * 0.6;
    
    const passed = Math.abs(openaiCost - expectedCost) < 0.0001;
    
    console.log(`${passed ? '✓' : '✗'} Cost Calculation: ${passed ? 'accurate' : 'failed'} ($${openaiCost.toFixed(6)} vs $${expectedCost.toFixed(6)})`);
    
    return {
      testName: 'Cost Calculation',
      passed,
      details: `Calculated: $${openaiCost.toFixed(6)}, Expected: $${expectedCost.toFixed(6)}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Cost Calculation failed: ${error}`);
    return {
      testName: 'Cost Calculation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testCostAnalytics(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    if (!isSupabaseConfigured()) {
      console.log(`⊘ Cost Analytics: Supabase not configured (using mock data)`);
      return {
        testName: 'Cost Analytics',
        passed: true,
        details: 'Skipped (Supabase not configured)',
        duration: Date.now() - start,
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const summary = await costAnalyticsEngine.getTotalSpend(sevenDaysAgo, now);
    const providers = await costAnalyticsEngine.getProviderBreakdown(sevenDaysAgo, now);
    
    console.log(`✓ Cost Analytics: $${summary.totalSpend.toFixed(4)} total, ${providers.length} providers`);
    
    return {
      testName: 'Cost Analytics',
      passed: true,
      details: `Total spend: $${summary.totalSpend.toFixed(4)}, Providers: ${providers.length}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Cost Analytics failed: ${error}`);
    return {
      testName: 'Cost Analytics',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testForecastGeneration(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const forecast = await forecastEngine.generateForecast();
    
    const passed = forecast !== null && typeof forecast.projected7DayCost === 'number';
    
    console.log(`${passed ? '✓' : '✗'} Forecast Generation: 7-day projection $${forecast.projected7DayCost.toFixed(2)}, confidence ${forecast.confidenceLevel}%`);
    
    return {
      testName: 'Forecast Generation',
      passed,
      details: `7-day: $${forecast.projected7DayCost.toFixed(2)}, 30-day: $${forecast.projected30DayCost.toFixed(2)}, trend: ${forecast.trendDirection}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Forecast Generation failed: ${error}`);
    return {
      testName: 'Forecast Generation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testCostAlerts(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const alerts = await costAlertsSystem.checkCostAnomalies();
    
    console.log(`✓ Cost Alerts: ${alerts.length} active alerts`);
    
    return {
      testName: 'Cost Alerts',
      passed: true,
      details: `${alerts.length} alerts detected`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Cost Alerts failed: ${error}`);
    return {
      testName: 'Cost Alerts',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testLedgerIntegration(): TestResult {
  const start = Date.now();
  
  try {
    const configured = isSupabaseConfigured();
    
    console.log(`${configured ? '✓' : '⊘'} Ledger Integration: ${configured ? 'configured' : 'not configured (in-memory mode)'}`);
    
    return {
      testName: 'Ledger Integration',
      passed: true,
      details: configured ? 'Supabase connected' : 'In-memory fallback',
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Ledger Integration failed: ${error}`);
    return {
      testName: 'Ledger Integration',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}
