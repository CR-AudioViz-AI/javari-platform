/**
 * IdentityOS™ — Core Types and Models
 * 
 * Canonical user identity and authentication models
 * Aligns with: CRAI-OPERATING-SYSTEMS.md (Section 2.2)
 * 
 * @package @crai/identity
 * @module IdentityOS/Models
 */

// ============================================================================
// USER IDENTITY MODELS
// ============================================================================

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  profile: UserProfile;
  roles: UserRole[];
  permissions: Permission[];
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  [key: string]: unknown;
}

export interface UserMetadata {
  registrationSource: string;
  registrationIp?: string;
  lastLoginIp?: string;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Date;
  accountLocked: boolean;
  accountLockedUntil?: Date;
  accountLockedReason?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  mfaSecret?: string;
  mfaRecoveryCodes?: string[];
}

// ============================================================================
// AUTHENTICATION MODELS
// ============================================================================

export interface AuthCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

export interface MagicLinkToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  usedAt?: Date;
  ipAddress: string;
}

// ============================================================================
// OAUTH MODELS
// ============================================================================

export type OAuthProvider = 'google' | 'github' | 'apple' | 'microsoft';

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType: string;
  idToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthProfile {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

// ============================================================================
// ROLE & PERMISSION MODELS (RBAC)
// ============================================================================

export type SystemRole = 
  | 'super_admin'
  | 'platform_admin'
  | 'security_admin'
  | 'compliance_officer';

/**
 * SUPER_ADMIN Role Definition
 * 
 * Highest privilege tier with the following guarantees:
 * - Cannot be deleted or downgraded (protected role)
 * - Inherits all permissions from all OS layers (*:*:*)
 * - All actions fully audited (no bypasses)
 * - Explicit ALLOW in PolicyOS (not bypassed)
 * - Requires explicit assignment by system
 * 
 * Assignment criteria:
 * - Platform owners (Roy Henderson, Cindy Henderson)
 * - System service accounts (Javari AI)
 * - Emergency access (break-glass procedures)
 * 
 * Compliance: Fully audited, traceable, revocable
 */
export const SUPER_ADMIN_ROLE = 'super_admin' as const;

/**
 * Protected roles that cannot be removed once assigned
 * Attempts to remove these roles will be blocked and audited
 */
export const PROTECTED_ROLES: SystemRole[] = ['super_admin'];

/**
 * Service account type for automated system operations
 */
export const SERVICE_ACCOUNT_TYPE = 'service_account' as const;

export type OrganizationRole =
  | 'organization_owner'
  | 'organization_admin'
  | 'project_admin'
  | 'billing_admin'
  | 'developer'
  | 'operator'
  | 'viewer';

export type UserRole = SystemRole | OrganizationRole | 'user';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  scope: 'own' | 'org' | 'platform';
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: unknown;
}

// Format: {resource}:{action}:{scope}
// Examples: users:read:own, projects:delete:platform
export type PermissionString = string;

// ============================================================================
// ROLE DEFINITIONS (CANONICAL)
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, PermissionString[]> = {
  // System Roles
  super_admin: ['*:*:platform'], // Full platform access
  platform_admin: [
    'users:*:platform',
    'organizations:*:platform',
    'projects:*:platform',
    'billing:read:platform',
    'audit:read:platform',
  ],
  security_admin: [
    'users:read:platform',
    'security:*:platform',
    'audit:read:platform',
  ],
  compliance_officer: [
    'users:read:platform',
    'audit:*:platform',
    'compliance:*:platform',
  ],

  // Organization Roles
  organization_owner: [
    'users:*:org',
    'projects:*:org',
    'billing:*:org',
    'settings:*:org',
  ],
  organization_admin: [
    'users:read:org',
    'users:update:org',
    'projects:*:org',
    'settings:read:org',
  ],
  project_admin: [
    'projects:*:org',
    'users:read:org',
  ],
  billing_admin: [
    'billing:*:org',
    'users:read:org',
  ],
  developer: [
    'projects:read:org',
    'projects:update:org',
    'code:*:org',
  ],
  operator: [
    'projects:read:org',
    'deployments:*:org',
  ],
  viewer: [
    'projects:read:org',
    'users:read:own',
  ],

  // Base User Role
  user: [
    'users:read:own',
    'users:update:own',
    'profile:*:own',
  ],
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export class IdentityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IdentityError';
  }
}

export class AuthenticationError extends IdentityError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_FAILED', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends IdentityError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED', 403);
    this.name = 'AuthorizationError';
  }
}

export class UserNotFoundError extends IdentityError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundError';
  }
}

export class SessionExpiredError extends IdentityError {
  constructor() {
    super('Session has expired', 'SESSION_EXPIRED', 401);
    this.name = 'SessionExpiredError';
  }
}

export class AccountLockedError extends IdentityError {
  constructor(reason?: string) {
    super(
      `Account is locked${reason ? `: ${reason}` : ''}`,
      'ACCOUNT_LOCKED',
      403
    );
    this.name = 'AccountLockedError';
  }
}

// ============================================================================
// SERVICE ACCOUNT MODELS
// ============================================================================

export interface ServiceAccount extends Omit<User, 'profile' | 'phoneNumber' | 'phoneVerified'> {
  type: 'service_account';
  name: string;
  description: string;
  apiKey: string;
  apiKeyHash: string;
  allowedOrigins: string[];
  rateLimit: number;
  enabled: boolean;
}

export interface CreateServiceAccountData {
  email: string;
  name: string;
  description: string;
  roles: UserRole[];
  allowedOrigins?: string[];
  rateLimit?: number;
}

// ============================================================================
// ADMIN EXECUTION MODELS
// ============================================================================

export interface AdminExecutionContext {
  executedBy: string;
  executedByRole: UserRole[];
  command: string;
  params: Record<string, unknown>;
  timestamp: Date;
  auditId?: string;
  requiresApproval: boolean;
}

export interface AdminExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  auditId: string;
}
