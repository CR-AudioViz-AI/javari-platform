/**
 * Phase Ω: API Factory
 * Creates API definitions from universe manifest
 */

export function generateAPI(manifest: any) {
  return manifest.api.map((name: string) => ({
    route: `/api/universe/${manifest.id}/${name}`,
    handler: `${manifest.id}_${name}_handler`,
  }));
}
