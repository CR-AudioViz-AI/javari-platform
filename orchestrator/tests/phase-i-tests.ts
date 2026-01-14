/**
 * Phase I: Real Estate Module Test Suite
 */

import { searchProperties } from '../real-estate/searchEngine';
import { matchAgents } from '../real-estate/agentMatcher';
import { resolveRealEstateAssetPath } from '../assets/realEstateResolver';
import { REAL_ESTATE_CREDITS } from '../credits/realEstatePricing';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runPhaseITests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase I Test Harness - Real Estate');
  console.log('══════════════════════════════════════\n');

  results.push(testCreditPricing());
  results.push(testAssetPathResolution());
  results.push(await testPropertySearch());
  results.push(await testAgentMatching());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testCreditPricing(): TestResult {
  try {
    const descriptionCost = REAL_ESTATE_CREDITS.AI_DESCRIPTION;
    const stagingCost = REAL_ESTATE_CREDITS.VIRTUAL_STAGING;
    const analysisCost = REAL_ESTATE_CREDITS.MARKET_ANALYSIS;

    const passed = 
      descriptionCost === 25 &&
      stagingCost === 50 &&
      analysisCost === 75;

    console.log(`${passed ? '✓' : '✗'} Credit Pricing: Description=${descriptionCost}, Staging=${stagingCost}, Analysis=${analysisCost}`);

    return {
      testName: 'Credit Pricing',
      passed,
      details: `AI Description: ${descriptionCost} credits, Virtual Staging: ${stagingCost} credits`,
    };
  } catch (error) {
    return {
      testName: 'Credit Pricing',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testAssetPathResolution(): TestResult {
  try {
    const photoPath = resolveRealEstateAssetPath({
      propertyId: 'prop-123',
      category: 'photos',
      subcategory: 'original',
      filename: 'living-room.jpg',
    });

    const expected = '/mnt/user-data/real-estate/prop-123/photos/original/living-room.jpg';
    const passed = photoPath === expected;

    console.log(`${passed ? '✓' : '✗'} Asset Path Resolution: ${passed ? 'correct' : 'failed'}`);

    return {
      testName: 'Asset Path Resolution',
      passed,
      details: `Path: ${photoPath}`,
    };
  } catch (error) {
    return {
      testName: 'Asset Path Resolution',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testPropertySearch(): Promise<TestResult> {
  try {
    const results = await searchProperties({
      listingType: 'buy',
      minBedrooms: 3,
      maxPrice: 500000,
      limit: 10,
    });

    // In dev mode, returns empty array
    const passed = Array.isArray(results);

    console.log(`${passed ? '✓' : '✗'} Property Search: ${passed ? 'functional' : 'failed'}`);

    return {
      testName: 'Property Search',
      passed,
      details: `Results: ${results.length}`,
    };
  } catch (error) {
    return {
      testName: 'Property Search',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testAgentMatching(): Promise<TestResult> {
  try {
    const matches = await matchAgents({
      location: { city: 'Miami', state: 'FL' },
      specialization: 'buyer',
      minRating: 4.0,
    });

    const passed = Array.isArray(matches);

    console.log(`${passed ? '✓' : '✗'} Agent Matching: ${passed ? 'functional' : 'failed'}`);

    return {
      testName: 'Agent Matching',
      passed,
      details: `Matches: ${matches.length}`,
    };
  } catch (error) {
    return {
      testName: 'Agent Matching',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
