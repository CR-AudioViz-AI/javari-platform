/**
 * Collectibles Category Registry
 * Phase III: Dynamic category plugin system
 */

import fs from 'fs';
import path from 'path';

export interface CategoryConfig {
  id: string;
  name: string;
  attributes: CategoryAttribute[];
  aiHints: {
    identificationPrompt: string;
    gradingRules: string;
    valuationRules: string;
  };
  supportedTools: string[];
}

export interface CategoryAttribute {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  required?: boolean;
  options?: string[];
}

class CategoryRegistry {
  private categories: Map<string, CategoryConfig> = new Map();
  private loaded = false;

  /**
   * Load all category configs from JSON files
   */
  loadCategories(): void {
    if (this.loaded) return;

    const categoriesDir = path.join(__dirname, 'categories');
    
    // In production, read from filesystem
    // In dev mode, use hardcoded configs
    if (fs.existsSync(categoriesDir)) {
      const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
      
      files.forEach(file => {
        const filePath = path.join(categoriesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const config = JSON.parse(content) as CategoryConfig;
        
        if (this.validateConfig(config)) {
          this.categories.set(config.id, config);
        }
      });
    }

    this.loaded = true;
  }

  /**
   * Validate category config
   */
  private validateConfig(config: any): boolean {
    return !!(
      config.id &&
      config.name &&
      Array.isArray(config.attributes) &&
      config.aiHints &&
      Array.isArray(config.supportedTools)
    );
  }

  /**
   * Get category config by ID
   */
  getCategoryConfig(id: string): CategoryConfig | null {
    this.loadCategories();
    return this.categories.get(id) || null;
  }

  /**
   * Get all categories
   */
  getAllCategories(): CategoryConfig[] {
    this.loadCategories();
    return Array.from(this.categories.values());
  }

  /**
   * Check if category exists
   */
  hasCategory(id: string): boolean {
    this.loadCategories();
    return this.categories.has(id);
  }
}

export const categoryRegistry = new CategoryRegistry();

/**
 * Helper function
 */
export function getCategoryConfig(id: string): CategoryConfig | null {
  return categoryRegistry.getCategoryConfig(id);
}
