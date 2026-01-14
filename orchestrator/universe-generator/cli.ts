#!/usr/bin/env node

/**
 * Universe Generator CLI
 * Phase Ω-II - Auto-Generation Engine
 */

import { buildUniverse } from './generator';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npx javari make-universe <universeId>");
  console.log("\nExample: npx javari make-universe wine_cellar");
  console.log("\nThis will generate:");
  console.log("  - Universe manifest");
  console.log("  - Default workflows");
  console.log("  - API route stubs");
  console.log("  - UI entry point");
  console.log("  - Asset directories");
  process.exit(1);
}

const universeId = args[0];

(async () => {
  console.log("🚀 Generating universe:", universeId);
  try {
    await buildUniverse(universeId);
    console.log("✨ Universe created successfully:", universeId);
    console.log("\nNext steps:");
    console.log("  1. Review manifest: orchestrator/universes/manifests/" + universeId + ".json");
    console.log("  2. Customize workflows in: orchestrator/workflows/" + universeId + "/");
    console.log("  3. Enable feature flag: NEXT_PUBLIC_" + universeId.toUpperCase() + "_ENABLED=true");
  } catch (error) {
    console.error("❌ Failed to generate universe:", error);
    process.exit(1);
  }
})();
