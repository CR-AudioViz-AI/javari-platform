/**
 * Phase Ω-V — Type definitions for integrity system
 */

export interface IntegrityReport {
  timestamp: string;
  totalUniverses: number;
  validUniverses: number;
  invalidUniverses: number;
  circularDependencies: boolean;
  loadOrder: string[];
  validationResults: Record<string, {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  graphStats: {
    totalNodes: number;
    totalEdges: number;
    orphanNodes: number;
    maxDepth: number;
  };
}

export interface SpecificationMetadata {
  version: string;
  schemaVersion: string;
  lastUpdated: string;
  author?: string;
  tags?: string[];
}
