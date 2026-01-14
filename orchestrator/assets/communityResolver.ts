/**
 * Community Asset Vault Resolver
 * Phase G: Community-scoped asset management
 */

export interface CommunityAssetPath {
  communityId: string;
  tool: string;
  assetType: string;
  year?: number;
  month?: number;
  filename?: string;
}

/**
 * Resolve community asset path
 */
export function resolveCommunityAssetPath(params: CommunityAssetPath): string {
  const { communityId, tool, assetType, year, month, filename } = params;

  let path = `/mnt/user-data/communities/${communityId}/${tool}/${assetType}`;

  if (year) {
    path += `/${year}`;
    if (month) {
      path += `/${String(month).padStart(2, '0')}`;
    }
  }

  if (filename) {
    path += `/${filename}`;
  }

  return path;
}

/**
 * Get community templates path
 */
export function getCommunityTemplatesPath(communityId: string, tool: string): string {
  return resolveCommunityAssetPath({
    communityId,
    tool,
    assetType: 'templates',
  });
}

/**
 * Get community exports path
 */
export function getCommunityExportsPath(communityId: string, tool: string): string {
  const now = new Date();
  return resolveCommunityAssetPath({
    communityId,
    tool,
    assetType: 'exports',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
}

/**
 * Get community uploads path
 */
export function getCommunityUploadsPath(communityId: string, tool: string): string {
  return resolveCommunityAssetPath({
    communityId,
    tool,
    assetType: 'uploads',
  });
}
