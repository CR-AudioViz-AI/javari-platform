/**
 * Proof Engine Test Suite
 * Phase Ω-IV
 */

import { verifyUniverse } from '../proof/universeVerifier';
import { runFullProof } from '../proof/proofRunner';
import type { UniverseManifestType } from '../universes/registry/universeRegistry';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runProofEngineTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-IV Test Harness - Proof Engine');
  console.log('══════════════════════════════════════\n');

  results.push(await testVerificationKernel());
  results.push(await testManifestValidation());
  results.push(await testWorkflowValidation());
  results.push(await testFullProofRunner());
  results.push(testReportGeneration());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

async function testVerificationKernel(): Promise<TestResult> {
  try {
    const testManifest: UniverseManifestType = {
      id: 'test_universe',
      name: 'Test Universe',
      description: 'Test',
      version: '1.0.0',
      features: ['test_feature'],
      workflows: ['test_workflow'],
      api: ['test_api'],
      ui: ['test_ui'],
      credits: { TEST: 30 }
    };

    const result = await verifyUniverse('test_universe', testManifest);
    
    const passed = 
      result.universeId === 'test_universe' &&
      result.manifestValid === true &&
      result.loadTimeMs > 0;

    console.log(`${passed ? '✓' : '✗'} Verification Kernel: Basic validation working`);

    return {
      testName: 'Verification Kernel',
      passed,
      details: `Verified in ${result.loadTimeMs.toFixed(1)}ms`,
    };
  } catch (error) {
    return {
      testName: 'Verification Kernel',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testManifestValidation(): Promise<TestResult> {
  try {
    const validManifest: UniverseManifestType = {
      id: 'valid',
      name: 'Valid Universe',
      description: 'Complete manifest',
      version: '1.0.0',
      features: ['feature1'],
      workflows: ['workflow1'],
      api: ['api1'],
      ui: ['ui1'],
      credits: { FEATURE1: 50 }
    };

    const result = await verifyUniverse('valid', validManifest);
    
    const passed = result.manifestValid === true;

    console.log(`${passed ? '✓' : '✗'} Manifest Validation: Complete manifest passes`);

    return {
      testName: 'Manifest Validation',
      passed,
      details: `Manifest checks: ${JSON.stringify(result.details.manifestChecks)}`,
    };
  } catch (error) {
    return {
      testName: 'Manifest Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testWorkflowValidation(): Promise<TestResult> {
  try {
    const manifest: UniverseManifestType = {
      id: 'workflow_test',
      name: 'Workflow Test',
      description: 'Test',
      version: '1.0.0',
      features: [],
      workflows: ['nonexistent_workflow'],
      api: [],
      ui: [],
      credits: {}
    };

    const result = await verifyUniverse('workflow_test', manifest);
    
    // Should detect missing workflow file
    const passed = 
      result.workflowsValid === false &&
      result.errors.some(e => e.includes('Workflow file missing'));

    console.log(`${passed ? '✓' : '✗'} Workflow Validation: Missing workflows detected`);

    return {
      testName: 'Workflow Validation',
      passed,
      details: `Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`,
    };
  } catch (error) {
    return {
      testName: 'Workflow Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testFullProofRunner(): Promise<TestResult> {
  try {
    const report = await runFullProof();
    
    const passed = 
      report.totalUniverses >= 0 &&
      report.passedUniverses >= 0 &&
      report.failedUniverses >= 0 &&
      Array.isArray(report.results);

    console.log(`${passed ? '✓' : '✗'} Full Proof Runner: Report generated successfully`);

    return {
      testName: 'Full Proof Runner',
      passed,
      details: `Verified ${report.totalUniverses} universes, ${report.passedUniverses} passed`,
    };
  } catch (error) {
    return {
      testName: 'Full Proof Runner',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testReportGeneration(): TestResult {
  try {
    const fs = require('fs');
    const exists = fs.existsSync('proof-results.json');
    
    if (exists) {
      const content = fs.readFileSync('proof-results.json', 'utf-8');
      const report = JSON.parse(content);
      
      const hasRequiredFields = 
        'timestamp' in report &&
        'totalUniverses' in report &&
        'results' in report;

      console.log(`${hasRequiredFields ? '✓' : '✗'} Report Generation: proof-results.json created`);

      return {
        testName: 'Report Generation',
        passed: hasRequiredFields,
        details: `Report file exists with ${report.results?.length || 0} results`,
      };
    } else {
      console.log(`✗ Report Generation: proof-results.json not found`);
      return {
        testName: 'Report Generation',
        passed: false,
        details: 'Report file not created',
      };
    }
  } catch (error) {
    return {
      testName: 'Report Generation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
