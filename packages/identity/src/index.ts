/**
 * @crai/identity — IdentityOS™
 * 
 * User identity and authentication management
 * 
 * @package @crai/identity
 * @module IdentityOS
 */

export const OS_NAME = 'IdentityOS';
export const OS_VERSION = '1.0.0';
export const OS_DOMAIN = 'identity';

// Export all models
export * from './models';

// Export in-memory implementations (Phase 0.3 - for testing/fallback)
export * from './user-directory';
export { userDirectory } from './user-directory';
export * from './authentication';
export { authenticationService } from './authentication';

// Export database implementations (Phase 0.4 - production)
export * from './database-repository';
export { databaseUserDirectory, databaseAuthService } from './database-repository';

// Convenience re-exports
export type {
  User,
  UserProfile,
  UserRole,
  AuthCredentials,
  AuthSession,
  Permission,
  PermissionString,
} from './models';

// Export service account manager
export * from './service-account-manager';
export { serviceAccountManager, initializeJavariServiceAccount } from './service-account-manager';
