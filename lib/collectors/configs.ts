/**
 * Collector Configurations - Phase 1 Foundation
 * 
 * This will define all 70+ collector categories with their:
 * - Branding (name, icon, colors)
 * - Custom fields
 * - Valuation sources
 * - Features
 * 
 * Currently just example configurations.
 */

export interface CollectorConfig {
  displayName: string;
  icon: string;
  primaryColor: string;
  tagline: string;
  fields: string[];
  valuationSource?: string;
  features: string[];
}

export const collectorConfigs: Record<string, CollectorConfig> = {
  'comic-crypt': {
    displayName: 'Comic Vault',
    icon: '🦸',
    primaryColor: '#DC2626',
    tagline: 'Manage your comic book collection',
    fields: ['title', 'issue', 'publisher', 'year', 'grade', 'value'],
    valuationSource: 'comicbookrealm',
    features: ['barcode-scan', 'price-tracking', 'wishlist'],
  },

  'card-vault': {
    displayName: 'Card Keeper',
    icon: '🎴',
    primaryColor: '#2563EB',
    tagline: 'Track your trading card collection',
    fields: ['player', 'year', 'set', 'number', 'parallel', 'grade', 'value'],
    valuationSource: 'ebay',
    features: ['barcode-scan', 'set-completion', 'portfolio-tracking'],
  },

  // Additional 68 collector configs will be added in Phase 2+
  // This is a placeholder showing the pattern
};

export const COLLECTOR_CONFIGS_STUB_MESSAGE = 
  "⚠️ Only 2 example collector configs defined. Full 70+ configs coming in Phase 2+";
