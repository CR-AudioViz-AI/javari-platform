/**
 * Real Estate Asset Vault Resolver
 * Phase I: Property-scoped asset management
 */

export interface RealEstateAssetPath {
  propertyId: string;
  category: 'photos' | 'documents' | 'marketing' | 'analytics';
  subcategory?: string;
  filename?: string;
}

export function resolveRealEstateAssetPath(params: RealEstateAssetPath): string {
  const { propertyId, category, subcategory, filename } = params;

  let path = `/mnt/user-data/real-estate/${propertyId}/${category}`;

  if (subcategory) {
    path += `/${subcategory}`;
  }

  if (filename) {
    path += `/${filename}`;
  }

  return path;
}

export function getPropertyPhotosPath(propertyId: string, staged: boolean = false): string {
  return resolveRealEstateAssetPath({
    propertyId,
    category: 'photos',
    subcategory: staged ? 'staged' : 'original',
  });
}

export function getPropertyDocumentsPath(propertyId: string, type: string): string {
  return resolveRealEstateAssetPath({
    propertyId,
    category: 'documents',
    subcategory: type,
  });
}
