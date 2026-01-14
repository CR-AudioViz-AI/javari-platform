/**
 * Presentation Maker Test Suite
 * Phase F: Content tool integration testing
 */

import { presentationMakerWorkflow } from '../../workflows/content-tools/presentation-maker.workflow';
import { validateWorkflow } from '../../workflows/schema';
import { WorkflowEngine } from '../../workflows/engine';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runPresentationMakerTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Presentation Maker Test Suite');
  console.log('══════════════════════════════════════\n');

  // Test 1: Workflow Validation
  results.push(testWorkflowValidation());

  // Test 2: Workflow Execution
  results.push(await testWorkflowExecution());

  // Test 3: Cost Tracking
  results.push(await testCostTracking());

  // Test 4: Provider Fallback
  results.push(testProviderFallback());

  // Test 5: Asset Vault Integration
  results.push(testAssetVaultIntegration());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

function testWorkflowValidation(): TestResult {
  try {
    const validation = validateWorkflow(presentationMakerWorkflow);
    
    const passed = validation.valid && presentationMakerWorkflow.steps.length === 4;
    
    console.log(`${passed ? '✓' : '✗'} Workflow Validation: ${validation.valid ? 'valid' : 'invalid'}`);
    
    return {
      testName: 'Workflow Validation',
      passed,
      details: `Steps: ${presentationMakerWorkflow.steps.length}, Valid: ${validation.valid}`,
    };
  } catch (error) {
    console.log(`✗ Workflow Validation failed: ${error}`);
    return {
      testName: 'Workflow Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testWorkflowExecution(): Promise<TestResult> {
  try {
    const engine = new WorkflowEngine();
    
    const testWorkflow = {
      ...presentationMakerWorkflow,
      steps: [presentationMakerWorkflow.steps[0]], // Only test first step
    };
    
    const result = await engine.execute(testWorkflow, 'test-user');
    
    const passed = result.status === 'completed';
    
    console.log(`${passed ? '✓' : '✗'} Workflow Execution: ${result.status}`);
    
    return {
      testName: 'Workflow Execution',
      passed,
      details: `Status: ${result.status}, Cost: $${result.totalCostUSD.toFixed(4)}`,
    };
  } catch (error) {
    console.log(`✗ Workflow Execution failed: ${error}`);
    return {
      testName: 'Workflow Execution',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testCostTracking(): Promise<TestResult> {
  try {
    // Verify cost limits are set
    const workflow = presentationMakerWorkflow;
    const hasCostLimit = workflow.settings?.maxTotalCost !== undefined;
    const costLimit = workflow.settings?.maxTotalCost || 0;
    
    const passed = hasCostLimit && costLimit > 0 && costLimit <= 1.0;
    
    console.log(`${passed ? '✓' : '✗'} Cost Tracking: $${costLimit} limit`);
    
    return {
      testName: 'Cost Tracking',
      passed,
      details: `Cost limit: $${costLimit}, Within budget: ${passed}`,
    };
  } catch (error) {
    return {
      testName: 'Cost Tracking',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testProviderFallback(): TestResult {
  try {
    const workflow = presentationMakerWorkflow;
    const contentStep = workflow.steps.find(s => s.id === 'content');
    
    const hasFallback = contentStep?.onFailure !== undefined;
    const fallbackStep = workflow.steps.find(s => s.id === contentStep?.onFailure);
    
    const passed = hasFallback && fallbackStep !== undefined;
    
    console.log(`${passed ? '✓' : '✗'} Provider Fallback: ${hasFallback ? 'configured' : 'missing'}`);
    
    return {
      testName: 'Provider Fallback',
      passed,
      details: `Fallback: ${contentStep?.onFailure || 'none'}`,
    };
  } catch (error) {
    return {
      testName: 'Provider Fallback',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testAssetVaultIntegration(): TestResult {
  try {
    // Verify asset paths are defined
    const { PRESENTATION_ASSET_PATHS } = require('../../assets/content-tools/presentation-maker.assetmap');
    
    const hasTemplates = PRESENTATION_ASSET_PATHS.TEMPLATES !== undefined;
    const hasExports = PRESENTATION_ASSET_PATHS.EXPORTS !== undefined;
    
    const passed = hasTemplates && hasExports;
    
    console.log(`${passed ? '✓' : '✗'} Asset Vault Integration: ${passed ? 'configured' : 'missing'}`);
    
    return {
      testName: 'Asset Vault Integration',
      passed,
      details: `Paths configured: ${passed ? 'yes' : 'no'}`,
    };
  } catch (error) {
    return {
      testName: 'Asset Vault Integration',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
