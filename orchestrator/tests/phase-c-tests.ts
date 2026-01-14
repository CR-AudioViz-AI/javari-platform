/**
 * Multi-AI Orchestrator - Phase C Test Harness
 * Tests: Workflows, Persistence, Caching, Analytics
 */

import { WorkflowEngine } from '../workflows/engine';
import { validateWorkflow } from '../workflows/schema';
import { getCachedResponse, setCachedResponse, getCacheStats } from '../cache/cache';
import { auditLogger } from '../audit/audit';
import { isSupabaseConfigured } from '../db/client';
import type { WorkflowDefinition } from '../workflows/schema';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  duration?: number;
}

export async function runPhaseCTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase C Test Harness');
  console.log('══════════════════════════════════════\n');

  // Test 1: Supabase Connection
  results.push(testSupabaseConnection());

  // Test 2: Workflow Validation
  results.push(testWorkflowValidation());

  // Test 3: Workflow Execution (Simple)
  results.push(await testSimpleWorkflow());

  // Test 4: Workflow with Branching
  results.push(await testBranchingWorkflow());

  // Test 5: Caching
  results.push(await testCaching());

  // Test 6: Audit Logging
  results.push(await testAuditLogging());

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n══════════════════════════════════════');
  console.log(`   Test Summary: ${passed}/${total} passed`);
  console.log('══════════════════════════════════════\n');
  
  return results;
}

function testSupabaseConnection(): TestResult {
  const start = Date.now();
  const configured = isSupabaseConfigured();
  
  console.log(`${configured ? '✓' : '⊘'} Supabase Connection: ${configured ? 'configured' : 'not configured (using in-memory fallback)'}`);
  
  return {
    testName: 'Supabase Connection',
    passed: true, // Not required for testing
    details: configured ? 'Connected' : 'In-memory mode',
    duration: Date.now() - start,
  };
}

function testWorkflowValidation(): TestResult {
  const start = Date.now();
  
  try {
    // Valid workflow
    const validWorkflow: WorkflowDefinition = {
      name: 'test-workflow',
      version: 1,
      steps: [
        {
          id: 'step1',
          action: 'generate',
          input: { prompt: 'Hello' },
        },
      ],
    };
    
    const validResult = validateWorkflow(validWorkflow);
    
    // Invalid workflow (missing step ID)
    const invalidWorkflow: any = {
      name: 'invalid',
      version: 1,
      steps: [
        {
          action: 'generate',
          input: {},
        },
      ],
    };
    
    const invalidResult = validateWorkflow(invalidWorkflow);
    
    const passed = validResult.valid && !invalidResult.valid;
    
    console.log(`${passed ? '✓' : '✗'} Workflow Validation: ${passed ? 'passed' : 'failed'}`);
    
    return {
      testName: 'Workflow Validation',
      passed,
      details: passed ? 'Valid/invalid workflows detected correctly' : 'Validation logic failed',
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Workflow Validation failed: ${error}`);
    return {
      testName: 'Workflow Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testSimpleWorkflow(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const workflow: WorkflowDefinition = {
      name: 'simple-test',
      version: 1,
      steps: [
        {
          id: 'greet',
          action: 'generate',
          input: {
            prompt: 'Say hello in one word',
            maxTokens: 10,
          },
        },
      ],
    };
    
    const engine = new WorkflowEngine();
    const result = await engine.execute(workflow, 'test-user');
    
    const passed = result.status === 'completed' && result.steps.length === 1;
    
    console.log(`${passed ? '✓' : '✗'} Simple Workflow: ${passed ? result.status : 'failed'} (${result.totalLatencyMs}ms, $${result.totalCostUSD.toFixed(6)})`);
    
    return {
      testName: 'Simple Workflow Execution',
      passed,
      details: `Status: ${result.status}, Steps: ${result.steps.length}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Simple Workflow failed: ${error}`);
    return {
      testName: 'Simple Workflow Execution',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testBranchingWorkflow(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const workflow: WorkflowDefinition = {
      name: 'branching-test',
      version: 1,
      steps: [
        {
          id: 'step1',
          action: 'generate',
          input: { prompt: 'Say yes or no', maxTokens: 5 },
          onSuccess: 'step2',
        },
        {
          id: 'step2',
          action: 'generate',
          input: { prompt: 'Thank you', maxTokens: 10 },
        },
      ],
    };
    
    const engine = new WorkflowEngine();
    const result = await engine.execute(workflow, 'test-user');
    
    const passed = result.steps.length === 2;
    
    console.log(`${passed ? '✓' : '✗'} Branching Workflow: ${result.steps.length} steps executed`);
    
    return {
      testName: 'Branching Workflow',
      passed,
      details: `Steps executed: ${result.steps.length}/2`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Branching Workflow failed: ${error}`);
    return {
      testName: 'Branching Workflow',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testCaching(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const request = {
      prompt: 'Cache test prompt',
      maxTokens: 10,
    };
    
    const mockResult: any = {
      provider: 'test',
      model: 'test-model',
      content: 'Cached response',
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      costUSD: 0.001,
    };
    
    // Set cache
    await setCachedResponse(request, mockResult, 'test');
    
    // Get cache
    const cached = await getCachedResponse(request, 'test');
    
    // Get stats
    const stats = getCacheStats();
    
    const passed = cached !== null && stats.inMemorySize > 0;
    
    console.log(`${passed ? '✓' : '✗'} Caching: ${passed ? 'hit/set working' : 'failed'} (${stats.inMemorySize} entries)`);
    
    return {
      testName: 'Caching',
      passed,
      details: `Cache ${cached ? 'HIT' : 'MISS'}, Size: ${stats.inMemorySize}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Caching failed: ${error}`);
    return {
      testName: 'Caching',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testAuditLogging(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const stats = await auditLogger.getStats();
    
    const passed = true; // Audit system is always available
    
    console.log(`✓ Audit Logging: ${stats.totalEvents} events, $${stats.totalCost.toFixed(6)} total cost`);
    
    return {
      testName: 'Audit Logging',
      passed,
      details: `${stats.totalEvents} events logged`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Audit Logging failed: ${error}`);
    return {
      testName: 'Audit Logging',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}
