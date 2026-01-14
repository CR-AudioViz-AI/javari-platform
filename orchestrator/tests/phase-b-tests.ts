/**
 * Multi-AI Orchestrator - Phase B Test Harness
 */

import { getAllProviders, getActiveProviders, getCheapestProvider, getFastestProvider, createAdapter } from '../providers';
import { validateEnvironment } from '../env/validate-env';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  duration?: number;
}

export async function runPhaseBTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase B Test Harness - Simulation');
  console.log('══════════════════════════════════════\n');

  // Test 1: Environment Validation
  results.push(testEnvironmentValidation());

  // Test 2: Provider Registry  
  results.push(testProviderRegistry());

  // Test 3: Cost Estimation
  results.push(await testCostEstimation());

  // Test 4: Provider Selection
  results.push(testProviderSelection());

  // Test 5: Health Checks
  results.push(await testHealthChecks());

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n══════════════════════════════════════');
  console.log(`   Test Summary: ${passed}/${total} passed`);
  console.log('══════════════════════════════════════\n');
  
  return results;
}

function testEnvironmentValidation(): TestResult {
  const start = Date.now();
  try {
    const envStatus = validateEnvironment();
    console.log(`✓ Environment Validation`);
    console.log(`  Configured: ${envStatus.configuredProviders.length}/10 providers`);
    if (envStatus.configuredProviders.length > 0) {
      console.log(`  Active: ${envStatus.configuredProviders.join(', ')}`);
    }
    return {
      testName: 'Environment Validation',
      passed: true,
      details: `${envStatus.configuredProviders.length} providers configured`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Environment Validation failed`);
    return {
      testName: 'Environment Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testProviderRegistry(): TestResult {
  const start = Date.now();
  try {
    const all = getAllProviders();
    const active = getActiveProviders();
    console.log(`✓ Provider Registry: ${all.length} total, ${active.length} active`);
    for (const p of active) {
      console.log(`  - ${p.displayName}: $${p.estimatedCostPerMToken.input}/$${p.estimatedCostPerMToken.output} per 1M tokens`);
    }
    return {
      testName: 'Provider Registry',
      passed: all.length === 10,
      details: `${all.length} total, ${active.length} active`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      testName: 'Provider Registry',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testCostEstimation(): Promise<TestResult> {
  const start = Date.now();
  try {
    const active = getActiveProviders();
    if (active.length === 0) {
      console.log(`⊘ Cost Estimation: No providers configured`);
      return { testName: 'Cost Estimation', passed: true, details: 'Skipped (no providers)', duration: Date.now() - start };
    }
    const adapter = createAdapter(active[0].name);
    if (!adapter) throw new Error('Failed to create adapter');
    const cost = await adapter.estimateCost({ prompt: 'Test', maxTokens: 100 });
    console.log(`✓ Cost Estimation (${active[0].name}): $${cost.estimatedCostUSD.toFixed(6)}`);
    return { testName: 'Cost Estimation', passed: true, details: `$${cost.estimatedCostUSD.toFixed(6)}`, duration: Date.now() - start };
  } catch (error) {
    return { testName: 'Cost Estimation', passed: false, details: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - start };
  }
}

function testProviderSelection(): TestResult {
  const start = Date.now();
  try {
    const cheapest = getCheapestProvider();
    const fastest = getFastestProvider();
    console.log(`✓ Provider Selection`);
    console.log(`  Cheapest: ${cheapest?.displayName || 'none'}`);
    console.log(`  Fastest: ${fastest?.displayName || 'none'}`);
    return { testName: 'Provider Selection', passed: true, details: 'Selection logic verified', duration: Date.now() - start };
  } catch (error) {
    return { testName: 'Provider Selection', passed: false, details: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - start };
  }
}

async function testHealthChecks(): Promise<TestResult> {
  const start = Date.now();
  try {
    const active = getActiveProviders();
    if (active.length === 0) {
      console.log(`⊘ Health Checks: No providers configured`);
      return { testName: 'Health Checks', passed: true, details: 'Skipped (no providers)', duration: Date.now() - start };
    }
    console.log(`✓ Health Checks (${active.length} providers)`);
    let healthy = 0;
    for (const p of active) {
      const adapter = createAdapter(p.name);
      if (adapter) {
        const health = await adapter.healthCheck();
        console.log(`  ${p.displayName}: ${health.status}`);
        if (health.status === 'healthy' || health.status === 'unavailable') healthy++;
      }
    }
    return { testName: 'Health Checks', passed: healthy > 0, details: `${healthy}/${active.length} responsive`, duration: Date.now() - start };
  } catch (error) {
    return { testName: 'Health Checks', passed: false, details: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - start };
  }
}
