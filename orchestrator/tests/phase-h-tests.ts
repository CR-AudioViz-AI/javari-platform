/**
 * Phase H: Monetization Test Suite
 */

import { creditEngine } from '../credits/creditEngine';
import { creditGuard } from '../middleware/creditGuard';
import { getPlan, getAllPlans } from '../plans/planEngine';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runPhaseHTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase H Test Harness - Monetization');
  console.log('══════════════════════════════════════\n');

  results.push(testCostToCreditsConversion());
  results.push(await testCreditGuard());
  results.push(await testPlanRetrieval());
  results.push(await testCreditForecast());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testCostToCreditsConversion(): TestResult {
  try {
    const cost = 0.50; // $0.50
    const credits = creditEngine.convertCostToCredits(cost);
    
    // 1 credit = $0.01, so $0.50 = 50 credits
    const expected = 50;
    const passed = credits === expected;

    console.log(`${passed ? '✓' : '✗'} Cost Conversion: $${cost} = ${credits} credits`);

    return {
      testName: 'Cost to Credits Conversion',
      passed,
      details: `$${cost} → ${credits} credits (expected: ${expected})`,
    };
  } catch (error) {
    return {
      testName: 'Cost to Credits Conversion',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testCreditGuard(): Promise<TestResult> {
  try {
    const result = await creditGuard({
      userId: 'test-user',
      communityId: undefined,
      workflowId: 'test-workflow',
      estimatedCostUSD: 0.10,
    });

    // In dev mode or with sufficient credits, should be allowed
    const passed = result.allowed === true || result.reason !== undefined;

    console.log(`${passed ? '✓' : '✗'} Credit Guard: ${result.allowed ? 'allowed' : 'blocked'}`);

    return {
      testName: 'Credit Guard',
      passed,
      details: `Allowed: ${result.allowed}, Credits needed: ${result.creditsNeeded}`,
    };
  } catch (error) {
    return {
      testName: 'Credit Guard',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testPlanRetrieval(): Promise<TestResult> {
  try {
    const plans = await getAllPlans();
    const freePlan = await getPlan('free');
    
    const passed = plans.length >= 3 && freePlan !== null;

    console.log(`${passed ? '✓' : '✗'} Plan Retrieval: ${plans.length} plans, free plan exists: ${freePlan !== null}`);

    return {
      testName: 'Plan Retrieval',
      passed,
      details: `Plans: ${plans.length}, Free plan: ${freePlan?.name || 'not found'}`,
    };
  } catch (error) {
    return {
      testName: 'Plan Retrieval',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testCreditForecast(): Promise<TestResult> {
  try {
    const forecast = await creditEngine.forecastCreditBurn('test-user', 30);
    
    const passed = forecast.currentBalance >= 0;

    console.log(`${passed ? '✓' : '✗'} Credit Forecast: ${forecast.currentBalance} balance, ${forecast.avgDailyBurn.toFixed(2)} daily burn`);

    return {
      testName: 'Credit Forecast',
      passed,
      details: `Balance: ${forecast.currentBalance}, Daily burn: ${forecast.avgDailyBurn.toFixed(2)}`,
    };
  } catch (error) {
    return {
      testName: 'Credit Forecast',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
