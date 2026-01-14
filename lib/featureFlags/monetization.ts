/**
 * Monetization Feature Flags
 * Phase H: Billing and credit system controls
 */

export const MONETIZATION_FLAGS = {
  BILLING_ENABLED: process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true',
  CREDITS_ENABLED: process.env.NEXT_PUBLIC_CREDITS_ENABLED === 'true',
  USAGE_LIMITS_ENABLED: process.env.NEXT_PUBLIC_USAGE_LIMITS_ENABLED === 'true',
  FREE_TIER_ENABLED: process.env.NEXT_PUBLIC_FREE_TIER_ENABLED === 'true',
  ENTERPRISE_MODE: process.env.NEXT_PUBLIC_ENTERPRISE_MODE === 'true',
  CREDIT_ALERTS_ENABLED: process.env.NEXT_PUBLIC_CREDIT_ALERTS_ENABLED === 'true',
} as const;

export function isBillingEnabled(): boolean {
  return MONETIZATION_FLAGS.BILLING_ENABLED;
}

export function areCreditsEnabled(): boolean {
  return MONETIZATION_FLAGS.CREDITS_ENABLED;
}

export function areUsageLimitsEnabled(): boolean {
  return MONETIZATION_FLAGS.USAGE_LIMITS_ENABLED;
}
