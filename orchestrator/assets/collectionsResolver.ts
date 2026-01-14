/**
 * Collections Asset Vault Resolver
 * Phase II: Account-scoped asset management
 */

export interface CollectionsAssetPath {
  accountId: string;
  category: 'documents' | 'letters' | 'notes' | 'summaries' | 'audio';
  filename?: string;
}

export function resolveCollectionsAssetPath(params: CollectionsAssetPath): string {
  const { accountId, category, filename } = params;
  
  let path = `/mnt/user-data/collections/${accountId}/${category}`;
  
  if (filename) {
    path += `/${filename}`;
  }
  
  return path;
}

export function getAccountDocumentsPath(accountId: string): string {
  return resolveCollectionsAssetPath({ accountId, category: 'documents' });
}

export function getAccountLettersPath(accountId: string): string {
  return resolveCollectionsAssetPath({ accountId, category: 'letters' });
}

export function getAccountNotesPath(accountId: string): string {
  return resolveCollectionsAssetPath({ accountId, category: 'notes' });
}

export function getAccountSummariesPath(accountId: string): string {
  return resolveCollectionsAssetPath({ accountId, category: 'summaries' });
}

export function getAccountAudioPath(accountId: string): string {
  return resolveCollectionsAssetPath({ accountId, category: 'audio' });
}
