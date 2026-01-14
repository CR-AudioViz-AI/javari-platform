/**
 * Phase II: Collections Universe Test Suite
 */

import { scoreAccount, segmentAccounts } from '../collections/segmentationEngine';
import { generateOutreach, filterForCompliance } from '../collections/outreachGenerator';
import { COLLECTIONS_CREDITS } from '../credits/collectionsPricing';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runCollectionsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase II Test Harness - Collections');
  console.log('══════════════════════════════════════\n');

  results.push(testSegmentation());
  results.push(testComplianceFilter());
  results.push(testCreditPricing());
  results.push(await testOutreachGeneration());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testSegmentation(): TestResult {
  try {
    const account = {
      id: 'test-123',
      balance: 5000,
      age: 45,
      state: 'CA',
      responsiveness: 0.6,
    };

    const scored = scoreAccount(account);
    
    const passed = scored.score > 0 && scored.segment !== undefined;

    console.log(`${passed ? '✓' : '✗'} Segmentation: Score=${scored.score.toFixed(1)}, Segment=${scored.segment}`);

    return {
      testName: 'Segmentation',
      passed,
      details: `Score: ${scored.score}, Segment: ${scored.segment}`,
    };
  } catch (error) {
    return {
      testName: 'Segmentation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testComplianceFilter(): TestResult {
  try {
    const safe = "Please contact us to discuss payment arrangements.";
    const unsafe = "We will arrest you if you don't pay immediately.";

    const safeResult = filterForCompliance(safe);
    const unsafeResult = filterForCompliance(unsafe);

    const passed = safeResult.safe && !unsafeResult.safe;

    console.log(`${passed ? '✓' : '✗'} Compliance Filter: Safe=${safeResult.safe}, Unsafe=${unsafeResult.safe}`);

    return {
      testName: 'Compliance Filter',
      passed,
      details: `Safe text passed: ${safeResult.safe}, Unsafe blocked: ${!unsafeResult.safe}`,
    };
  } catch (error) {
    return {
      testName: 'Compliance Filter',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testCreditPricing(): TestResult {
  try {
    const intelligence = COLLECTIONS_CREDITS.ACCOUNT_INTELLIGENCE;
    const segmentation = COLLECTIONS_CREDITS.SEGMENTATION;
    const report = COLLECTIONS_CREDITS.CLIENT_REPORT;

    const passed = 
      intelligence === 60 &&
      segmentation === 50 &&
      report === 90;

    console.log(`${passed ? '✓' : '✗'} Credit Pricing: Intelligence=${intelligence}, Segmentation=${segmentation}`);

    return {
      testName: 'Credit Pricing',
      passed,
      details: `Intelligence: ${intelligence} credits, Report: ${report} credits`,
    };
  } catch (error) {
    return {
      testName: 'Credit Pricing',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testOutreachGeneration(): Promise<TestResult> {
  try {
    const content = await generateOutreach({
      accountId: 'test-123',
      debtorName: 'John Doe',
      balance: 1500,
      originalCreditor: 'ABC Bank',
      type: 'first_notice',
    });

    const passed = 
      content.subject.length > 0 &&
      content.complianceChecks.length > 0 &&
      content.body.includes('Mini-Miranda');

    console.log(`${passed ? '✓' : '✗'} Outreach Generation: ${content.complianceChecks.length} compliance checks`);

    return {
      testName: 'Outreach Generation',
      passed,
      details: `Compliance checks: ${content.complianceChecks.length}`,
    };
  } catch (error) {
    return {
      testName: 'Outreach Generation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
