/**
 * PolicyOS™ — SUPER_ADMIN Policy Definitions
 * 
 * Highest privilege tier policies with full audit compliance
 * 
 * @package @crai/policy
 * @module PolicyOS/SuperAdminPolicies
 */

import type { Policy } from './models';

/**
 * SUPER_ADMIN Root Access Policy
 * 
 * Grants unlimited access to all resources, actions, and scopes
 * - Fully audited (no bypasses)
 * - Explicit ALLOW (not skipped)
 * - Cannot be overridden by other policies
 * - Highest priority (1)
 */
export const SUPER_ADMIN_ROOT_POLICY: Policy = {
  id: 'policy_super_admin_root',
  name: 'SUPER_ADMIN Root Access',
  description: 'Unlimited access for super_admin role - all resources, all actions, all scopes',
  version: 1,
  priority: 1, // Highest priority
  status: 'active',
  effect: 'allow',
  category: 'system',
  
  rules: {
    roles: ['super_admin'],
    resources: ['*'], // All resources
    actions: ['*'],   // All actions
    scopes: ['*'],    // All scopes
  },
  
  conditions: {
    // No conditions - always applies for super_admin
  },
  
  metadata: {
    system: true,
    protected: true,
    non_deletable: true,
    created_by: 'system',
    compliance: 'fully_audited',
    notes: 'Enterprise-grade elevated permissions with full audit trail',
  },
  
  createdAt: new Date('2026-01-18T06:00:00Z'),
  updatedAt: new Date('2026-01-18T06:00:00Z'),
  createdBy: 'system',
};

/**
 * SERVICE_ACCOUNT Admin Policy
 * 
 * Allows service accounts with super_admin role to execute automated tasks
 */
export const SERVICE_ACCOUNT_ADMIN_POLICY: Policy = {
  id: 'policy_service_account_admin',
  name: 'Service Account Admin Access',
  description: 'Automated execution permissions for service accounts with super_admin role',
  version: 1,
  priority: 2,
  status: 'active',
  effect: 'allow',
  category: 'system',
  
  rules: {
    roles: ['super_admin'],
    resources: [
      'api:*',
      'database:*',
      'workflows:*',
      'integrations:*',
      'automation:*',
    ],
    actions: ['*'],
    scopes: ['platform'],
  },
  
  conditions: {
    userType: 'service_account',
  },
  
  metadata: {
    system: true,
    protected: true,
    automation_enabled: true,
  },
  
  createdAt: new Date('2026-01-18T06:00:00Z'),
  updatedAt: new Date('2026-01-18T06:00:00Z'),
  createdBy: 'system',
};

/**
 * ADMIN_EXECUTE Command Policy
 * 
 * Allows execution of admin.execute commands
 */
export const ADMIN_EXECUTE_POLICY: Policy = {
  id: 'policy_admin_execute',
  name: 'Admin Execute Permission',
  description: 'Permission to use admin.execute for direct system commands',
  version: 1,
  priority: 3,
  status: 'active',
  effect: 'allow',
  category: 'system',
  
  rules: {
    roles: ['super_admin'],
    resources: ['admin:execute'],
    actions: ['execute'],
    scopes: ['platform'],
  },
  
  conditions: {},
  
  metadata: {
    system: true,
    protected: true,
    audit_required: true,
  },
  
  createdAt: new Date('2026-01-18T06:00:00Z'),
  updatedAt: new Date('2026-01-18T06:00:00Z'),
  createdBy: 'system',
};

/**
 * Protected System Policies
 * Cannot be deleted or modified through normal policy management
 */
export const PROTECTED_SYSTEM_POLICIES: Policy[] = [
  SUPER_ADMIN_ROOT_POLICY,
  SERVICE_ACCOUNT_ADMIN_POLICY,
  ADMIN_EXECUTE_POLICY,
];

/**
 * Initialize super admin policies in PolicyOS
 */
export function initializeSuperAdminPolicies(): Policy[] {
  return PROTECTED_SYSTEM_POLICIES;
}
