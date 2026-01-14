/**
 * Phase III: Collectibles Universe Test Suite
 */

import { categoryRegistry, getCategoryConfig } from '../collectibles/categoryRegistry';
import { COLLECTIBLES_CREDITS } from '../credits/collectiblesPricing';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runCollectiblesTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase III Test Harness - Collectibles');
  console.log('══════════════════════════════════════\n');

  results.push(testCategoryRegistry());
  results.push(testShotGlassesCategory());
  results.push(testSpiritsCategory());
  results.push(testCreditPricing());
  results.push(testAttributeEngine());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testCategoryRegistry(): TestResult {
  try {
    const categories = categoryRegistry.getAllCategories();
    const spiritsConfig = getCategoryConfig('spirits');
    const shotGlassesConfig = getCategoryConfig('shot_glasses');

    const passed = 
      categories.length >= 11 &&
      spiritsConfig !== null &&
      shotGlassesConfig !== null;

    console.log(`${passed ? '✓' : '✗'} Category Registry: ${categories.length} categories loaded`);

    return {
      testName: 'Category Registry',
      passed,
      details: `Loaded ${categories.length} categories, spirits & shot_glasses present`,
    };
  } catch (error) {
    return {
      testName: 'Category Registry',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testShotGlassesCategory(): TestResult {
  try {
    const config = getCategoryConfig('shot_glasses');
    
    const passed = 
      config !== null &&
      config.name === 'Shot Glasses' &&
      config.attributes.length > 0 &&
      config.aiHints.identificationPrompt.length > 0;

    console.log(`${passed ? '✓' : '✗'} Shot Glasses Category: ${config ? 'configured' : 'missing'}`);

    return {
      testName: 'Shot Glasses Category',
      passed,
      details: config ? `${config.attributes.length} attributes, AI hints present` : 'Not found',
    };
  } catch (error) {
    return {
      testName: 'Shot Glasses Category',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testSpiritsCategory(): TestResult {
  try {
    const config = getCategoryConfig('spirits');
    
    const passed = 
      config !== null &&
      config.attributes.some(a => a.key === 'distillery') &&
      config.supportedTools.includes('identification');

    console.log(`${passed ? '✓' : '✗'} Spirits Category: ${config ? 'configured' : 'missing'}`);

    return {
      testName: 'Spirits Category',
      passed,
      details: config ? `${config.supportedTools.length} tools supported` : 'Not found',
    };
  } catch (error) {
    return {
      testName: 'Spirits Category',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testCreditPricing(): TestResult {
  try {
    const identification = COLLECTIBLES_CREDITS.IDENTIFICATION;
    const valuation = COLLECTIBLES_CREDITS.VALUATION;
    const grading = COLLECTIBLES_CREDITS.GRADING;

    const passed = 
      identification === 30 &&
      valuation === 75 &&
      grading === 40;

    console.log(`${passed ? '✓' : '✗'} Credit Pricing: ID=${identification}, Value=${valuation}`);

    return {
      testName: 'Credit Pricing',
      passed,
      details: `Identification: ${identification}, Valuation: ${valuation}, Grading: ${grading}`,
    };
  } catch (error) {
    return {
      testName: 'Credit Pricing',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testAttributeEngine(): TestResult {
  try {
    const spirits = getCategoryConfig('spirits');
    const watches = getCategoryConfig('watches');
    
    const spiritsHasDistillery = spirits?.attributes.some(a => a.key === 'distillery');
    const watchesHasMovement = watches?.attributes.some(a => a.key === 'movement');

    const passed = spiritsHasDistillery && watchesHasMovement;

    console.log(`${passed ? '✓' : '✗'} Attribute Engine: Category-specific attributes working`);

    return {
      testName: 'Attribute Engine',
      passed,
      details: `Spirits has distillery: ${spiritsHasDistillery}, Watches has movement: ${watchesHasMovement}`,
    };
  } catch (error) {
    return {
      testName: 'Attribute Engine',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
