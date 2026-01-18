/**
 * @crai/policy — PolicyOS™
 * 
 * Platform-wide policy definition and enforcement
 * 
 * @package @crai/policy
 * @module PolicyOS
 */

export const OS_NAME = 'PolicyOS';
export const OS_VERSION = '1.0.0';
export const OS_DOMAIN = 'policy';

// Export all models
export * from './models';

// Export in-memory implementation (Phase 0.3 - for testing/fallback)
export * from './policy-engine';
export { policyEngine } from './policy-engine';

// Export RBAC utilities
export * from './rbac';

// Convenience re-exports
export type {
  Policy,
  PolicyRule,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  Permission,
  PermissionString,
} from './models';

// Export super admin policies
export * from './super-admin-policies';
