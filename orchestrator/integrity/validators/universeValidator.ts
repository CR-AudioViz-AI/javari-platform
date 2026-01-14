/**
 * Phase Ω-V — Validates universe specifications
 */

import { UniverseSpecSchema, UniverseSpec, WorkflowSpecSchema, APISpecSchema } from "../specs/universeSpec";
import type { ZodError } from "zod";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a universe specification
 */
export function validateUniverseSpec(data: unknown): ValidationResult {
  const result = UniverseSpecSchema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: generateWarnings(result.data),
    };
  }
  
  return {
    valid: false,
    errors: formatZodErrors(result.error),
    warnings: [],
  };
}

/**
 * Validate a workflow specification
 */
export function validateWorkflowSpec(data: unknown): ValidationResult {
  const result = WorkflowSpecSchema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }
  
  return {
    valid: false,
    errors: formatZodErrors(result.error),
    warnings: [],
  };
}

/**
 * Validate an API specification
 */
export function validateAPISpec(data: unknown): ValidationResult {
  const result = APISpecSchema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }
  
  return {
    valid: false,
    errors: formatZodErrors(result.error),
    warnings: [],
  };
}

/**
 * Format Zod errors into readable messages
 */
function formatZodErrors(error: ZodError): string[] {
  return error.errors.map(e => {
    const path = e.path.join('.');
    return `${path}: ${e.message}`;
  });
}

/**
 * Generate warnings for valid but potentially problematic specs
 */
function generateWarnings(spec: UniverseSpec): string[] {
  const warnings: string[] = [];
  
  // Check for empty arrays
  if (spec.workflows.length === 0) {
    warnings.push('No workflows defined');
  }
  
  if (spec.apis.length === 0) {
    warnings.push('No API endpoints defined');
  }
  
  if (spec.ui.length === 0) {
    warnings.push('No UI pages defined');
  }
  
  // Check metrics
  if (spec.metrics.load_factor > 0.8) {
    warnings.push('Load factor is high (>0.8), consider optimization');
  }
  
  if (spec.metrics.response_expectation_ms > 5000) {
    warnings.push('Response expectation is high (>5s), consider caching');
  }
  
  if (spec.metrics.ai_cost_per_action > 1.0) {
    warnings.push('AI cost per action is high (>$1.00), review workflow efficiency');
  }
  
  // Check for missing description
  if (spec.description.length < 50) {
    warnings.push('Description is brief, consider adding more detail');
  }
  
  return warnings;
}

/**
 * Validate universe against another universe (compatibility check)
 */
export function validateCompatibility(
  universe: UniverseSpec,
  dependency: UniverseSpec
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Version compatibility check (simple semver-like check)
  const depVersion = dependency.version.split('.')[0];
  const universeVersion = universe.version.split('.')[0];
  
  if (depVersion !== universeVersion) {
    warnings.push(
      `Version mismatch: ${universe.id} (${universe.version}) depends on ${dependency.id} (${dependency.version})`
    );
  }
  
  // Check if dependency is deprecated
  if (dependency.status === 'deprecated') {
    warnings.push(
      `Depending on deprecated universe: ${dependency.id}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
