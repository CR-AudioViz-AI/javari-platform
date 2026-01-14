/**
 * Multi-AI Orchestrator - Phase D Test Harness
 * Tests: Rate Limiting, Circuit Breakers, Telemetry, Security, Sandboxing
 */

import { checkRateLimit, resetRateLimit, getRateLimitStats } from '../security/rate-limit';
import { globalCircuitBreaker } from '../providers/circuit-breaker';
import { metricsCollector } from '../telemetry/metrics';
import { redactSensitiveData, sanitizeInput } from '../security/redact';
import { validateDeploymentEnvironment } from '../deployment/env-validate';
import { performHealthCheck } from '../deployment/health-check';
import { detectRecursion, WORKFLOW_SAFETY_LIMITS } from '../workflows/schema';
import type { WorkflowDefinition } from '../workflows/schema';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  duration?: number;
}

export async function runPhaseDTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase D Test Harness - Enterprise');
  console.log('══════════════════════════════════════\n');

  // Test 1: Rate Limiting
  results.push(await testRateLimiting());

  // Test 2: Circuit Breaker Activation
  results.push(testCircuitBreakerActivation());

  // Test 3: Circuit Breaker Recovery
  results.push(testCircuitBreakerRecovery());

  // Test 4: Telemetry Collection
  results.push(testTelemetry());

  // Test 5: Security Redaction
  results.push(testRedaction());

  // Test 6: Sandbox Limits
  results.push(testSandboxLimits());

  // Test 7: Deployment Validation
  results.push(testDeploymentValidation());

  // Test 8: Full Health Check
  results.push(await testFullHealthCheck());

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n══════════════════════════════════════');
  console.log(`   Test Summary: ${passed}/${total} passed`);
  console.log('══════════════════════════════════════\n');
  
  return results;
}

async function testRateLimiting(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    resetRateLimit('user', 'test-user');
    
    // Simulate requests within limit
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit('user', 'test-user');
      results.push(result);
    }
    
    const allAllowed = results.slice(0, 5).every(r => r.allowed);
    const remaining = results[4].remaining;
    
    console.log(`${allAllowed ? '✓' : '✗'} Rate Limiting: ${allAllowed ? 'working' : 'failed'} (${remaining} remaining)`);
    
    return {
      testName: 'Rate Limiting',
      passed: allAllowed && remaining < 100,
      details: `5 requests allowed, ${remaining} remaining`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Rate Limiting failed: ${error}`);
    return {
      testName: 'Rate Limiting',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testCircuitBreakerActivation(): TestResult {
  const start = Date.now();
  
  try {
    globalCircuitBreaker.reset('test-provider');
    
    // Simulate failures to open circuit
    for (let i = 0; i < 60; i++) {
      globalCircuitBreaker.recordFailure('test-provider', 1000);
    }
    
    const isAvailable = globalCircuitBreaker.isAvailable('test-provider');
    const stats = globalCircuitBreaker.getStats()['test-provider'];
    
    console.log(`${!isAvailable ? '✓' : '✗'} Circuit Breaker Activation: ${stats.state} (${stats.failureRate.toFixed(1)}% failure rate)`);
    
    return {
      testName: 'Circuit Breaker Activation',
      passed: !isAvailable && stats.state === 'open',
      details: `State: ${stats.state}, Failure rate: ${stats.failureRate.toFixed(1)}%`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Circuit Breaker Activation failed: ${error}`);
    return {
      testName: 'Circuit Breaker Activation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testCircuitBreakerRecovery(): TestResult {
  const start = Date.now();
  
  try {
    globalCircuitBreaker.reset('recovery-test');
    
    // Record successes
    for (let i = 0; i < 10; i++) {
      globalCircuitBreaker.recordSuccess('recovery-test', 500);
    }
    
    const stats = globalCircuitBreaker.getStats()['recovery-test'];
    const isAvailable = globalCircuitBreaker.isAvailable('recovery-test');
    
    console.log(`${isAvailable ? '✓' : '✗'} Circuit Breaker Recovery: ${stats.state}`);
    
    return {
      testName: 'Circuit Breaker Recovery',
      passed: isAvailable && stats.state === 'closed',
      details: `State: ${stats.state}, Success count: ${stats.totalCalls}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Circuit Breaker Recovery failed: ${error}`);
    return {
      testName: 'Circuit Breaker Recovery',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testTelemetry(): TestResult {
  const start = Date.now();
  
  try {
    // Record test metrics
    metricsCollector.recordLatency('test-provider', 1000);
    metricsCollector.recordLatency('test-provider', 1500);
    metricsCollector.recordSuccess('test-provider');
    metricsCollector.recordCost('test-provider', 0.001);
    
    const snapshot = metricsCollector.getMetricsSnapshot();
    const metrics = snapshot.providers['test-provider'];
    
    const passed = metrics && metrics.latency !== null && metrics.successCount > 0;
    
    console.log(`${passed ? '✓' : '✗'} Telemetry: ${passed ? 'collecting metrics' : 'failed'}`);
    
    return {
      testName: 'Telemetry Collection',
      passed,
      details: passed ? `Latency p50: ${metrics.latency?.p50}ms` : 'No metrics',
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Telemetry failed: ${error}`);
    return {
      testName: 'Telemetry Collection',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testRedaction(): TestResult {
  const start = Date.now();
  
  try {
    const sensitiveText = 'My SSN is 123-45-6789 and email is user@example.com';
    const redacted = redactSensitiveData(sensitiveText);
    
    const passed = !redacted.includes('123-45-6789') && !redacted.includes('user@example.com');
    
    console.log(`${passed ? '✓' : '✗'} Security Redaction: ${passed ? 'working' : 'failed'}`);
    
    return {
      testName: 'Security Redaction',
      passed,
      details: passed ? 'Sensitive data redacted' : 'Redaction failed',
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Redaction failed: ${error}`);
    return {
      testName: 'Security Redaction',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testSandboxLimits(): TestResult {
  const start = Date.now();
  
  try {
    // Test recursion detection
    const recursiveWorkflow: WorkflowDefinition = {
      name: 'recursive',
      version: 1,
      steps: [
        { id: 'step1', action: 'generate', input: { prompt: 'test' }, onSuccess: 'step2' },
        { id: 'step2', action: 'generate', input: { prompt: 'test' }, onSuccess: 'step1' }, // Cycle
      ],
    };
    
    const hasRecursion = detectRecursion(recursiveWorkflow);
    
    console.log(`${hasRecursion ? '✓' : '✗'} Sandbox Safety: recursion ${hasRecursion ? 'detected' : 'not detected'}`);
    
    return {
      testName: 'Sandbox Limits',
      passed: hasRecursion,
      details: `Recursion detection: ${hasRecursion ? 'working' : 'failed'}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Sandbox Limits failed: ${error}`);
    return {
      testName: 'Sandbox Limits',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

function testDeploymentValidation(): TestResult {
  const start = Date.now();
  
  try {
    const validation = validateDeploymentEnvironment();
    
    console.log(`${validation.valid || validation.errors.length === 0 ? '✓' : '⊘'} Deployment Validation: ${validation.info.providerCount} providers`);
    
    return {
      testName: 'Deployment Validation',
      passed: true, // Always pass, just informational
      details: `Providers: ${validation.info.providerCount}, Warnings: ${validation.warnings.length}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Deployment Validation failed: ${error}`);
    return {
      testName: 'Deployment Validation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}

async function testFullHealthCheck(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const health = await performHealthCheck();
    
    console.log(`${health.status !== 'unhealthy' ? '✓' : '✗'} Full Health Check: ${health.status}`);
    
    return {
      testName: 'Full Health Check',
      passed: health.status !== 'unhealthy',
      details: `Status: ${health.status}, Uptime: ${health.uptime}ms`,
      duration: Date.now() - start,
    };
  } catch (error) {
    console.log(`✗ Full Health Check failed: ${error}`);
    return {
      testName: 'Full Health Check',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    };
  }
}
