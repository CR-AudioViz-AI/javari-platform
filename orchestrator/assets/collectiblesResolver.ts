/**
 * Collectibles Asset Vault Resolver
 * Phase III: Item-scoped asset management
 */

export interface CollectiblesAssetPath {
  collectibleId: string;
  category: 'images' | 'documents';
  filename?: string;
}

export function resolveCollectiblesAssetPath(params: CollectiblesAssetPath): string {
  const { collectibleId, category, filename } = params;
  
  let path = `/mnt/user-data/collectibles/${collectibleId}/${category}`;
  
  if (filename) {
    path += `/${filename}`;
  }
  
  return path;
}

export function getCollectibleImagesPath(collectibleId: string): string {
  return resolveCollectiblesAssetPath({ collectibleId, category: 'images' });
}

export function getCollectibleDocumentsPath(collectibleId: string): string {
  return resolveCollectiblesAssetPath({ collectibleId, category: 'documents' });
}
