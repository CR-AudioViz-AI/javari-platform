/**
 * Collectibles Credit Pricing
 * Phase III: Cost structure for collectibles features
 */

export const COLLECTIBLES_CREDITS = {
  IDENTIFICATION: 30,         // $0.30
  VALUATION: 75,              // $0.75
  GRADING: 40,                // $0.40
  AUTHENTICITY: 60,           // $0.60
  FORECAST: 50,               // $0.50
  SPIRIT_ENRICH: 25,          // $0.25
  PORTFOLIO_REPORT: 100,      // $1.00
  RARITY_DETECT: 35,          // $0.35
  COLLECTION_SUMMARY: 45,     // $0.45
  CATEGORY_CLASSIFIER: 20,    // $0.20
} as const;

export function getCollectiblesCreditCost(feature: keyof typeof COLLECTIBLES_CREDITS): number {
  return COLLECTIBLES_CREDITS[feature];
}

export function estimateFullAnalysis(): number {
  return COLLECTIBLES_CREDITS.IDENTIFICATION +
         COLLECTIBLES_CREDITS.VALUATION +
         COLLECTIBLES_CREDITS.GRADING +
         COLLECTIBLES_CREDITS.AUTHENTICITY;
}
