/**
 * Phase Ω: Universe Registry
 * Central loader for all universes
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const UniverseManifest = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  features: z.array(z.string()),
  workflows: z.array(z.string()),
  api: z.array(z.string()),
  ui: z.array(z.string()),
  credits: z.record(z.number()),
});

export type UniverseManifestType = z.infer<typeof UniverseManifest>;

export class UniverseRegistry {
  private universes: Map<string, UniverseManifestType> = new Map();

  loadAll() {
    const dir = path.join(process.cwd(), "orchestrator/universes/manifests");
    
    if (!fs.existsSync(dir)) {
      console.log('[UniverseRegistry] Manifests directory not found, skipping');
      return;
    }
    
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
        const parsed = UniverseManifest.parse(data);
        this.universes.set(parsed.id, parsed);
      }
    }
  }

  getUniverse(id: string) {
    return this.universes.get(id) || null;
  }

  getAllUniverses() {
    return Array.from(this.universes.values());
  }
}

export const universeRegistry = new UniverseRegistry();
