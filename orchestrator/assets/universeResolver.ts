/**
 * Phase Ω: Universe Asset Resolver
 */

export function resolveUniverseAssetPath(universeId: string, assetType: string) {
  return `/mnt/user-data/universes/${universeId}/${assetType}`;
}
