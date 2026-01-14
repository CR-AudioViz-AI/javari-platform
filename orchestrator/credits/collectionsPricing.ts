/**
 * Collections Credit Pricing
 * Phase II: Cost structure for debt operations
 */

export const COLLECTIONS_CREDITS = {
  ACCOUNT_INTELLIGENCE: 60,      // $0.60
  SEGMENTATION: 50,               // $0.50
  FIRST_NOTICE: 25,               // $0.25
  FOLLOW_UP: 30,                  // $0.30
  SETTLEMENT_OFFER: 50,           // $0.50
  DISPUTE_ACK: 25,                // $0.25
  CLIENT_REPORT: 90,              // $0.90
  SUPERVISOR_DIGEST: 40,          // $0.40
  PAYMENT_PLAN: 50,               // $0.50
  CALL_SHEET: 30,                 // $0.30
  CASE_SUMMARY: 45,               // $0.45
} as const;

export function getCollectionsCreditCost(feature: keyof typeof COLLECTIONS_CREDITS): number {
  return COLLECTIONS_CREDITS[feature];
}
