/**
 * Integrity Engine Test Suite
 * Phase Ω-V
 */

import { validateUniverseSpec, validateCompatibility } from '../integrity/validators/universeValidator';
import { UniverseGraph } from '../integrity/graph/universeGraph';
import { runIntegrityCheck } from '../integrity/integrityChecker';
import type { UniverseSpec } from '../integrity/specs/universeSpec';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runIntegrityEngineTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-V Test Harness - Integrity Engine');
  console.log('══════════════════════════════════════\n');

  results.push(testSpecValidation());
  results.push(testDependencyGraph());
  results.push(testCircularDependencyDetection());
  results.push(testCompatibilityCheck());
  results.push(await testFullIntegrityCheck());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testSpecValidation(): TestResult {
  try {
    const validSpec: UniverseSpec = {
      id: 'test_universe',
      name: 'Test Universe',
      version: '1.0.0',
      description: 'A test universe for validation',
      workflows: ['workflow1'],
      apis: ['api1'],
      ui: ['page1'],
      storage: [],
      features: ['feature1'],
      metrics: {
        load_factor: 0.5,
        response_expectation_ms: 2000,
        ai_cost_per_action: 0.50,
        max_concurrent_users: 100,
      },
      dependencies: [],
      integrations: [],
      credits: { ACTION: 50 },
      tags: ['test'],
      status: 'active',
    };

    const result = validateUniverseSpec(validSpec);
    
    const passed = result.valid && result.errors.length === 0;

    console.log(`${passed ? '✓' : '✗'} Spec Validation: Valid spec accepted`);

    return {
      testName: 'Spec Validation',
      passed,
      details: `Valid: ${result.valid}, Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`,
    };
  } catch (error) {
    return {
      testName: 'Spec Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testDependencyGraph(): TestResult {
  try {
    const graph = new UniverseGraph();
    
    graph.addUniverse('base', []);
    graph.addUniverse('child1', ['base']);
    graph.addUniverse('child2', ['base']);
    graph.addUniverse('grandchild', ['child1', 'child2']);
    
    const order = graph.resolveOrder();
    
    const passed = 
      order.length === 4 &&
      order.indexOf('base') < order.indexOf('child1') &&
      order.indexOf('base') < order.indexOf('child2') &&
      order.indexOf('child1') < order.indexOf('grandchild') &&
      order.indexOf('child2') < order.indexOf('grandchild');

    console.log(`${passed ? '✓' : '✗'} Dependency Graph: Correct load order`);

    return {
      testName: 'Dependency Graph',
      passed,
      details: `Load order: ${order.join(' → ')}`,
    };
  } catch (error) {
    return {
      testName: 'Dependency Graph',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testCircularDependencyDetection(): TestResult {
  try {
    const graph = new UniverseGraph();
    
    graph.addUniverse('a', ['b']);
    graph.addUniverse('b', ['c']);
    graph.addUniverse('c', ['a']); // Creates cycle
    
    const hasCircular = graph.hasCircularDependencies();
    
    const passed = hasCircular === true;

    console.log(`${passed ? '✓' : '✗'} Circular Dependency Detection: Cycle detected`);

    return {
      testName: 'Circular Dependency Detection',
      passed,
      details: `Circular dependencies: ${hasCircular}`,
    };
  } catch (error) {
    return {
      testName: 'Circular Dependency Detection',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testCompatibilityCheck(): TestResult {
  try {
    const universe: UniverseSpec = {
      id: 'app',
      name: 'App',
      version: '2.0.0',
      description: 'Main application',
      workflows: [],
      apis: [],
      ui: [],
      storage: [],
      features: [],
      metrics: {
        load_factor: 0.5,
        response_expectation_ms: 2000,
        ai_cost_per_action: 0.50,
        max_concurrent_users: 100,
      },
      dependencies: ['lib'],
      integrations: [],
      credits: {},
      tags: [],
      status: 'active',
    };

    const dependency: UniverseSpec = {
      ...universe,
      id: 'lib',
      name: 'Library',
      version: '1.5.0',
      dependencies: [],
    };

    const result = validateCompatibility(universe, dependency);
    
    const passed = result.warnings.some(w => w.includes('Version mismatch'));

    console.log(`${passed ? '✓' : '✗'} Compatibility Check: Version warnings generated`);

    return {
      testName: 'Compatibility Check',
      passed,
      details: `Warnings: ${result.warnings.length}`,
    };
  } catch (error) {
    return {
      testName: 'Compatibility Check',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testFullIntegrityCheck(): Promise<TestResult> {
  try {
    const report = await runIntegrityCheck();
    
    const passed = 
      report.totalUniverses >= 0 &&
      report.validUniverses >= 0 &&
      typeof report.circularDependencies === 'boolean' &&
      Array.isArray(report.loadOrder);

    console.log(`${passed ? '✓' : '✗'} Full Integrity Check: Report generated`);

    return {
      testName: 'Full Integrity Check',
      passed,
      details: `${report.validUniverses}/${report.totalUniverses} valid, Circular: ${report.circularDependencies}`,
    };
  } catch (error) {
    return {
      testName: 'Full Integrity Check',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
