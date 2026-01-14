/**
 * Universe Generator Test Suite
 * Phase Ω-II
 */

import { createManifestTemplate, createDefaultWorkflows } from '../universe-generator/templates';
import { validateUniverseManifest } from '../universe-generator/validate';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runUniverseGeneratorTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-II Test Harness - Universe Generator');
  console.log('══════════════════════════════════════\n');

  results.push(testManifestTemplate());
  results.push(testWorkflowGeneration());
  results.push(testManifestValidation());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testManifestTemplate(): TestResult {
  try {
    const manifest = createManifestTemplate("test_universe");
    
    const passed = 
      manifest.id === "test_universe" &&
      manifest.name.length > 0 &&
      manifest.version === "1.0.0";

    console.log(`${passed ? '✓' : '✗'} Manifest Template: ${manifest.name}`);

    return {
      testName: 'Manifest Template',
      passed,
      details: `ID: ${manifest.id}, Name: ${manifest.name}`,
    };
  } catch (error) {
    return {
      testName: 'Manifest Template',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testWorkflowGeneration(): TestResult {
  try {
    const workflows = createDefaultWorkflows("test_universe");
    
    const passed = 
      workflows.length === 3 &&
      workflows[0].name === "test_universe_summary";

    console.log(`${passed ? '✓' : '✗'} Workflow Generation: ${workflows.length} workflows created`);

    return {
      testName: 'Workflow Generation',
      passed,
      details: `Generated ${workflows.length} workflows`,
    };
  } catch (error) {
    return {
      testName: 'Workflow Generation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testManifestValidation(): TestResult {
  try {
    const manifest = createManifestTemplate("valid_test");
    manifest.workflows = ["workflow1", "workflow2"];
    manifest.api = ["create", "update"];
    manifest.ui = ["dashboard"];
    
    const validation = validateUniverseManifest(manifest);
    
    const passed = validation.valid;

    console.log(`${passed ? '✓' : '✗'} Manifest Validation: ${passed ? 'valid' : 'invalid'}`);

    return {
      testName: 'Manifest Validation',
      passed,
      details: passed ? 'Validation passed' : `Errors: ${validation.errors.join(', ')}`,
    };
  } catch (error) {
    return {
      testName: 'Manifest Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
