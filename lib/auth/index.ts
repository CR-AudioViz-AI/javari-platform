/**
 * Auth Placeholder - Phase 1 Foundation
 * 
 * This is a stub interface for authentication.
 * No real auth logic is implemented yet.
 * 
 * Future implementation will include:
 * - OAuth (Google, Microsoft, Apple)
 * - Email/password authentication
 * - Session management
 * - Role-based access control
 */

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptions: string[];
  role: 'free' | 'pro' | 'enterprise';
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Placeholder auth check
 * Returns null - no authentication implemented yet
 */
export async function getSession(): Promise<AuthSession> {
  return {
    user: null,
    isAuthenticated: false,
  };
}

/**
 * Placeholder user lookup
 */
export async function getUser(userId: string): Promise<User | null> {
  // Stub - will implement with database
  return null;
}

/**
 * Placeholder subscription check
 */
export function hasAccess(user: User | null, appId: string): boolean {
  // Stub - always returns true for development
  // Will implement real subscription logic later
  return true;
}

export const AUTH_STUB_MESSAGE = 
  "⚠️ Auth system is a placeholder stub. Real authentication coming in Phase 2+";
