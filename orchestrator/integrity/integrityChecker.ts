/**
 * Phase Ω-V — Integrity Checker
 * Validates all universes and builds dependency graph
 */

import { universeRegistry } from '../universes/registry/universeRegistry';
import { UniverseGraph } from './graph/universeGraph';
import { validateUniverseSpec, validateCompatibility } from './validators/universeValidator';
import { UniverseSpecSchema } from './specs/universeSpec';
import type { IntegrityReport } from './types';
import fs from 'fs';

export async function runIntegrityCheck(): Promise<IntegrityReport> {
  console.log('\n══════════════════════════════════════');
  console.log('   Phase Ω-V: Integrity Checker');
  console.log('══════════════════════════════════════\n');

  // Load all universes
  universeRegistry.loadAll();
  const universes = universeRegistry.getAllUniverses();
  
  console.log(`Found ${universes.length} universes to check\n`);

  const validationResults: Record<string, any> = {};
  const graph = new UniverseGraph();
  
  let validCount = 0;
  let invalidCount = 0;

  // Validate each universe
  for (const universe of universes) {
    console.log(`Checking: ${universe.name}...`);
    
    // Convert manifest to spec format
    const spec = {
      id: universe.id,
      name: universe.name,
      version: universe.version || '1.0.0',
      description: universe.description || '',
      workflows: universe.workflows || [],
      apis: universe.api || [],
      ui: universe.ui || [],
      storage: [],
      features: universe.features || [],
      metrics: {
        load_factor: 0.5,
        response_expectation_ms: 2000,
        ai_cost_per_action: 0.50,
        max_concurrent_users: 100,
      },
      dependencies: [],
      integrations: [],
      credits: universe.credits || {},
      tags: [],
      status: 'active' as const,
    };

    // Validate
    const result = validateUniverseSpec(spec);
    validationResults[universe.id] = result;

    if (result.valid) {
      validCount++;
      console.log(`  ✓ Valid`);
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => console.log(`    ⚠ ${w}`));
      }
    } else {
      invalidCount++;
      console.log(`  ✗ Invalid`);
      result.errors.forEach(e => console.log(`    - ${e}`));
    }

    // Add to graph
    graph.addUniverse(universe.id, spec.dependencies);
  }

  // Check for circular dependencies
  console.log('\nChecking dependency graph...');
  const hasCircular = graph.hasCircularDependencies();
  const loadOrder = hasCircular ? [] : graph.resolveOrder();
  const graphStats = graph.getStats();

  if (hasCircular) {
    console.log('  ✗ Circular dependencies detected!');
  } else {
    console.log('  ✓ No circular dependencies');
    console.log(`  Load order: ${loadOrder.join(' → ')}`);
  }

  console.log(`\n  Graph Stats:`);
  console.log(`    Nodes: ${graphStats.totalNodes}`);
  console.log(`    Edges: ${graphStats.totalEdges}`);
  console.log(`    Orphans: ${graphStats.orphanNodes}`);
  console.log(`    Max Depth: ${graphStats.maxDepth}`);

  // Generate report
  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    totalUniverses: universes.length,
    validUniverses: validCount,
    invalidUniverses: invalidCount,
    circularDependencies: hasCircular,
    loadOrder,
    validationResults,
    graphStats,
  };

  // Save report
  fs.writeFileSync(
    'integrity-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n══════════════════════════════════════');
  console.log('   Integrity Check Complete');
  console.log('══════════════════════════════════════');
  console.log(`Total: ${universes.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);
  console.log(`\nReport saved to: integrity-report.json\n`);

  return report;
}
