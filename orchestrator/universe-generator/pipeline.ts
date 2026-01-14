/**
 * Universe Build Pipeline
 * Phase Ω-II
 *
 * Generates multiple universes from a list.
 */

import { buildUniverse } from './generator';

export async function generateUniverses(list: string[]) {
  console.log("\n🚀 Starting universe batch generation...");
  console.log(`   Generating ${list.length} universes\n`);
  
  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  
  for (const id of list) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Building universe: ${id}`);
    console.log('='.repeat(60));
    
    try {
      await buildUniverse(id);
      results.push({ id, success: true });
      console.log(`\n✅ ${id} created successfully`);
    } catch (error) {
      results.push({ 
        id, 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`\n❌ ${id} failed:`, error);
    }
  }
  
  console.log("\n" + '='.repeat(60));
  console.log("BATCH GENERATION COMPLETE");
  console.log('='.repeat(60));
  console.log(`\nTotal: ${list.length}`);
  console.log(`Success: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  if (results.some(r => !r.success)) {
    console.log("\nFailed universes:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.id}: ${r.error}`);
    });
  }
  
  return results;
}
