/**
 * Universe Validation
 * Phase Ω-II
 */

import { z } from "zod";

export const UniverseManifestSchema = z.object({
  id: z.string().min(2).regex(/^[a-z_]+$/, "ID must be lowercase with underscores only"),
  name: z.string().min(5),
  description: z.string().min(10),
  version: z.string(),
  features: z.array(z.string()),
  workflows: z.array(z.string()),
  api: z.array(z.string()),
  ui: z.array(z.string()),
  credits: z.record(z.number())
});

export function validateUniverseManifest(manifest: any) {
  try {
    UniverseManifestSchema.parse(manifest);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { valid: false, errors: [String(error)] };
  }
}
