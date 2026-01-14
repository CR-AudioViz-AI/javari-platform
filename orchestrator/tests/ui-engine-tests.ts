/**
 * UI Engine Test Suite
 * Phase Ω-III
 */

import { generateUniverseUI } from '../ui-engine/uiFactory';
import type { UniverseManifestType } from '../universes/registry/universeRegistry';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export async function runUIEngineTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-III Test Harness - UI Engine');
  console.log('══════════════════════════════════════\n');

  results.push(await testUIGeneration());
  results.push(testComponentTemplates());
  results.push(testManifestDrivenFields());
  results.push(testWorkflowIntegration());
  results.push(testDarkModeSupport());

  const passed = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests Passed: ${passed}/${results.length}\n`);
  
  return results;
}

async function testUIGeneration(): Promise<TestResult> {
  try {
    const testManifest: UniverseManifestType = {
      id: 'test_universe',
      name: 'Test Universe',
      description: 'Test universe for UI generation',
      version: '1.0.0',
      features: ['ai_generation', 'portfolio'],
      workflows: ['test_workflow'],
      api: ['create', 'update'],
      ui: ['dashboard'],
      credits: { TEST: 30 }
    };

    const result = await generateUniverseUI({
      universeId: 'test_universe',
      manifest: testManifest,
      outputDir: 'orchestrator/ui-engine/test-output'
    });

    const passed = result.success && result.filesCreated.length >= 5;

    console.log(`${passed ? '✓' : '✗'} UI Generation: ${result.filesCreated.length} files created`);

    return {
      testName: 'UI Generation',
      passed,
      details: `Created ${result.filesCreated.length} files, Errors: ${result.errors.length}`,
    };
  } catch (error) {
    return {
      testName: 'UI Generation',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testComponentTemplates(): TestResult {
  try {
    const { generateHubPage } = require('../ui-engine/uiTemplates');
    
    const manifest: UniverseManifestType = {
      id: 'sample',
      name: 'Sample Universe',
      description: 'Sample',
      version: '1.0.0',
      features: ['test'],
      workflows: ['workflow1'],
      api: ['api1'],
      ui: ['ui1'],
      credits: {}
    };

    const hubPage = generateHubPage(manifest);
    
    const passed = 
      hubPage.includes('Sample Universe') &&
      hubPage.includes("'use client'") &&
      hubPage.includes('export default');

    console.log(`${passed ? '✓' : '✗'} Component Templates: Valid React components generated`);

    return {
      testName: 'Component Templates',
      passed,
      details: `Hub page contains ${hubPage.length} characters`,
    };
  } catch (error) {
    return {
      testName: 'Component Templates',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testManifestDrivenFields(): TestResult {
  try {
    const { generateToolsPage } = require('../ui-engine/uiTemplates');
    
    const manifest: UniverseManifestType = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      features: [],
      workflows: ['workflow_a', 'workflow_b', 'workflow_c'],
      api: [],
      ui: [],
      credits: {
        WORKFLOW_A: 25,
        WORKFLOW_B: 50,
        WORKFLOW_C: 75
      }
    };

    const toolsPage = generateToolsPage(manifest);
    
    const hasWorkflows = 
      toolsPage.includes('workflow_a') &&
      toolsPage.includes('workflow_b') &&
      toolsPage.includes('workflow_c');
    
    const hasCredits = toolsPage.includes('25') || toolsPage.includes('50');

    const passed = hasWorkflows && hasCredits;

    console.log(`${passed ? '✓' : '✗'} Manifest-Driven Fields: Workflows and credits rendered`);

    return {
      testName: 'Manifest-Driven Fields',
      passed,
      details: `Workflows: ${hasWorkflows}, Credits: ${hasCredits}`,
    };
  } catch (error) {
    return {
      testName: 'Manifest-Driven Fields',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testWorkflowIntegration(): TestResult {
  try {
    const { generateWorkflowsPage } = require('../ui-engine/uiTemplates');
    
    const manifest: UniverseManifestType = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      features: [],
      workflows: ['analyze', 'generate', 'summarize'],
      api: [],
      ui: [],
      credits: {}
    };

    const workflowsPage = generateWorkflowsPage(manifest);
    
    const hasWorkflowList = workflowsPage.includes('Available Workflows');
    const hasWorkflowDetails = workflowsPage.includes('WorkflowDetails');
    const hasAllWorkflows = 
      workflowsPage.includes('analyze') &&
      workflowsPage.includes('generate') &&
      workflowsPage.includes('summarize');

    const passed = hasWorkflowList && hasWorkflowDetails && hasAllWorkflows;

    console.log(`${passed ? '✓' : '✗'} Workflow Integration: All workflows attached correctly`);

    return {
      testName: 'Workflow Integration',
      passed,
      details: `List: ${hasWorkflowList}, Details: ${hasWorkflowDetails}, All present: ${hasAllWorkflows}`,
    };
  } catch (error) {
    return {
      testName: 'Workflow Integration',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function testDarkModeSupport(): TestResult {
  try {
    const { generateDashboardPage } = require('../ui-engine/uiTemplates');
    
    const manifest: UniverseManifestType = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      version: '1.0.0',
      features: [],
      workflows: [],
      api: [],
      ui: [],
      credits: {}
    };

    const dashboardPage = generateDashboardPage(manifest);
    
    const hasDarkMode = 
      dashboardPage.includes('dark:bg-gray-800') ||
      dashboardPage.includes('dark:text-gray-400') ||
      dashboardPage.includes('dark:');

    const hasResponsive = 
      dashboardPage.includes('md:') ||
      dashboardPage.includes('lg:');

    const passed = hasDarkMode && hasResponsive;

    console.log(`${passed ? '✓' : '✗'} Dark Mode Support: Dark mode and responsive classes present`);

    return {
      testName: 'Dark Mode Support',
      passed,
      details: `Dark mode: ${hasDarkMode}, Responsive: ${hasResponsive}`,
    };
  } catch (error) {
    return {
      testName: 'Dark Mode Support',
      passed: false,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
