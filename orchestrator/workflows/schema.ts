/**
 * Multi-AI Orchestrator - Workflow DSL Schema
 * Phase C: Workflow definition and validation
 */

export interface WorkflowStep {
  id: string;
  name?: string;
  provider?: string; // If not specified, uses router's auto-selection
  model?: string;
  action: 'generate' | 'analyze' | 'transform' | 'conditional';
  input: {
    prompt?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    // Support variable interpolation from previous steps
    variables?: Record<string, string>;
  };
  condition?: {
    // For conditional steps
    expression: string; // e.g., "{{step1.success}} == true"
    onTrue?: string; // Next step ID
    onFalse?: string; // Next step ID
  };
  onSuccess?: string; // Next step ID
  onFailure?: string; // Fallback step ID
  retry?: {
    maxAttempts: number;
    delayMs?: number;
  };
  cache?: boolean; // Whether to cache this step's result
}

export interface WorkflowDefinition {
  name: string;
  description?: string;
  version: number;
  steps: WorkflowStep[];
  variables?: Record<string, any>; // Global workflow variables
  settings?: {
    maxTotalCost?: number;
    timeout?: number; // milliseconds
    enableCaching?: boolean;
    requireApproval?: boolean;
  };
}

export interface WorkflowStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  provider?: string;
  model?: string;
  input?: any;
  output?: any;
  error?: string;
  costUSD?: number;
  latencyMs?: number;
  cached?: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface WorkflowRunResult {
  runId: string;
  workflowId?: string;
  workflowName: string;
  workflowVersion: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: WorkflowStepResult[];
  totalCostUSD: number;
  totalLatencyMs: number;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
  metadata?: any;
}

/**
 * Validate workflow definition
 */
export function validateWorkflow(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push('Workflow name is required');
  }

  if (!workflow.version || workflow.version < 1) {
    errors.push('Workflow version must be >= 1');
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
  }

  // Validate step IDs are unique
  const stepIds = new Set<string>();
  for (const step of workflow.steps || []) {
    if (!step.id) {
      errors.push('All steps must have an ID');
    } else if (stepIds.has(step.id)) {
      errors.push(`Duplicate step ID: ${step.id}`);
    } else {
      stepIds.add(step.id);
    }

    // Validate action
    if (!['generate', 'analyze', 'transform', 'conditional'].includes(step.action)) {
      errors.push(`Invalid action "${step.action}" in step ${step.id}`);
    }

    // Validate referenced step IDs exist
    if (step.onSuccess && !stepIds.has(step.onSuccess) && workflow.steps.find(s => s.id === step.onSuccess)) {
      // Will be validated after all steps are processed
    }
  }

  // Validate step references
  for (const step of workflow.steps || []) {
    if (step.onSuccess && !workflow.steps.find(s => s.id === step.onSuccess)) {
      errors.push(`Step ${step.id} references non-existent step: ${step.onSuccess}`);
    }
    if (step.onFailure && !workflow.steps.find(s => s.id === step.onFailure)) {
      errors.push(`Step ${step.id} references non-existent step: ${step.onFailure}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Interpolate variables in a string
 */
export function interpolateVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], variables);
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Workflow safety limits (sandbox)
 */
export const WORKFLOW_SAFETY_LIMITS = {
  MAX_STEPS: 20,
  MAX_TOTAL_COST_USD: 1.0,
  MAX_RUNTIME_MS: 300000, // 5 minutes
  MAX_RETRIES_PER_STEP: 5,
  MAX_TOKENS_PER_STEP: 10000,
};

/**
 * Detect recursion in workflow
 */
export function detectRecursion(workflow: WorkflowDefinition): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(stepId: string): boolean {
    if (stack.has(stepId)) return true; // Cycle detected
    if (visited.has(stepId)) return false;

    visited.add(stepId);
    stack.add(stepId);

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) return false;

    const nextSteps = [step.onSuccess, step.onFailure, step.condition?.onTrue, step.condition?.onFalse].filter(Boolean);
    
    for (const next of nextSteps) {
      if (next && dfs(next as string)) return true;
    }

    stack.delete(stepId);
    return false;
  }

  return workflow.steps.some(step => dfs(step.id));
}
