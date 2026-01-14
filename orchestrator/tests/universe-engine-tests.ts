/**
 * Phase Ω: Universe Engine Test Suite
 */

import { universeRegistry } from '../universes/registry/universeRegistry';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runUniverseEngineTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω Test Harness - Universe Engine');
  console.log('══════════════════════════════════════\n');

  results.push(testRegistryLoading());
  results.push(testUniverseManifests());
  results.push(testUniverseRetrieval());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testRegistryLoading(): TestResult {
  try {
    universeRegistry.loadAll();
    const universes = universeRegistry.getAllUniverses();
    
    const passed = universes.length >= 3;

    console.log(`${passed ? '✓' : '✗'} Registry Loading: ${universes.length} universes loaded`);

    return {
      testName: 'Registry Loading',
      passed,
      details: `Loaded ${universes.length} universes`,
    };
  } catch (error) {
    return {
      testName: 'Registry Loading',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testUniverseManifests(): TestResult {
  try {
    const realEstate = universeRegistry.getUniverse('real_estate');
    const collections = universeRegistry.getUniverse('collections');
    const collectibles = universeRegistry.getUniverse('collectibles');
    
    const passed = !!(realEstate && collections && collectibles);

    console.log(`${passed ? '✓' : '✗'} Universe Manifests: All 3 core universes present`);

    return {
      testName: 'Universe Manifests',
      passed,
      details: `Real Estate: ${!!realEstate}, Collections: ${!!collections}, Collectibles: ${!!collectibles}`,
    };
  } catch (error) {
    return {
      testName: 'Universe Manifests',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testUniverseRetrieval(): TestResult {
  try {
    const collectibles = universeRegistry.getUniverse('collectibles');
    
    const hasWorkflows = collectibles?.workflows && collectibles.workflows.length > 0;
    const hasCredits = collectibles?.credits && Object.keys(collectibles.credits).length > 0;
    
    const passed = !!(hasWorkflows && hasCredits);

    console.log(`${passed ? '✓' : '✗'} Universe Retrieval: Collectibles has ${collectibles?.workflows.length} workflows`);

    return {
      testName: 'Universe Retrieval',
      passed,
      details: `Workflows: ${collectibles?.workflows.length}, Credits: ${Object.keys(collectibles?.credits || {}).length}`,
    };
  } catch (error) {
    return {
      testName: 'Universe Retrieval',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
