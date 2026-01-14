/**
 * Real Estate Credit Pricing
 * Phase I: Cost structure for real estate features
 */

export const REAL_ESTATE_CREDITS = {
  AI_DESCRIPTION: 25,        // $0.25
  VIRTUAL_STAGING: 50,       // $0.50 per photo
  MARKET_ANALYSIS: 75,       // $0.75
  CONTRACT_GENERATION: 100,  // $1.00
  INVESTMENT_ANALYSIS: 75,   // $0.75
  NEIGHBORHOOD_INSIGHTS: 50, // $0.50
  PROPERTY_COMPARISON: 10,   // $0.10
  PRICING_RECOMMENDATION: 30, // $0.30
} as const;

export function getRealEstateCreditCost(feature: keyof typeof REAL_ESTATE_CREDITS): number {
  return REAL_ESTATE_CREDITS[feature];
}

export function estimateTotalCost(features: (keyof typeof REAL_ESTATE_CREDITS)[]): number {
  return features.reduce((total, feature) => total + REAL_ESTATE_CREDITS[feature], 0);
}
