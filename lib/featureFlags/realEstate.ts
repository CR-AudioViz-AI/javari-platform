/**
 * Real Estate Feature Flags
 * Phase I: Granular control for real estate features
 */

export const REAL_ESTATE_FLAGS = {
  REAL_ESTATE_ENABLED: process.env.NEXT_PUBLIC_REAL_ESTATE_ENABLED === 'true',
  REAL_ESTATE_AI_DESCRIPTIONS: process.env.NEXT_PUBLIC_REAL_ESTATE_AI_DESCRIPTIONS === 'true',
  REAL_ESTATE_VIRTUAL_STAGING: process.env.NEXT_PUBLIC_REAL_ESTATE_VIRTUAL_STAGING === 'true',
  REAL_ESTATE_CONTRACT_GEN: process.env.NEXT_PUBLIC_REAL_ESTATE_CONTRACT_GEN === 'true',
  REAL_ESTATE_AGENT_MATCHING: process.env.NEXT_PUBLIC_REAL_ESTATE_AGENT_MATCHING === 'true',
  REAL_ESTATE_MLS_SYNC: process.env.NEXT_PUBLIC_REAL_ESTATE_MLS_SYNC === 'true',
  REAL_ESTATE_INVESTMENT_TOOLS: process.env.NEXT_PUBLIC_REAL_ESTATE_INVESTMENT_TOOLS === 'true',
} as const;

export function isRealEstateEnabled(): boolean {
  return REAL_ESTATE_FLAGS.REAL_ESTATE_ENABLED;
}

export function isAIDescriptionsEnabled(): boolean {
  return REAL_ESTATE_FLAGS.REAL_ESTATE_ENABLED && REAL_ESTATE_FLAGS.REAL_ESTATE_AI_DESCRIPTIONS;
}

export function isVirtualStagingEnabled(): boolean {
  return REAL_ESTATE_FLAGS.REAL_ESTATE_ENABLED && REAL_ESTATE_FLAGS.REAL_ESTATE_VIRTUAL_STAGING;
}
