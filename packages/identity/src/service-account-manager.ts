/**
 * IdentityOS™ — Service Account Manager
 * 
 * Manages service accounts for automated system operations
 * 
 * @package @crai/identity
 * @module IdentityOS/ServiceAccountManager
 */

import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type { ServiceAccount, CreateServiceAccountData, UserRole } from './models';
import { SUPER_ADMIN_ROLE, SERVICE_ACCOUNT_TYPE } from './models';

const BCRYPT_ROUNDS = 12;

export class ServiceAccountManager {
  private accounts: Map<string, ServiceAccount> = new Map();

  /**
   * Create a new service account
   */
  async createServiceAccount(data: CreateServiceAccountData): Promise<ServiceAccount> {
    const id = `sa_${randomUUID()}`;
    const apiKey = this.generateApiKey();
    const apiKeyHash = await bcrypt.hash(apiKey, BCRYPT_ROUNDS);

    const account: ServiceAccount = {
      id,
      email: data.email,
      emailVerified: true,
      phoneVerified: false,
      type: SERVICE_ACCOUNT_TYPE,
      name: data.name,
      description: data.description,
      apiKey, // Only returned once during creation
      apiKeyHash,
      roles: data.roles,
      permissions: [],
      allowedOrigins: data.allowedOrigins || ['*'],
      rateLimit: data.rateLimit || 1000,
      enabled: true,
      metadata: {
        accountType: 'service',
        createdBy: 'system',
        createdVia: 'service_account_manager',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.accounts.set(id, account);
    return account;
  }

  /**
   * Get service account by ID
   */
  async getServiceAccount(id: string): Promise<ServiceAccount | null> {
    return this.accounts.get(id) || null;
  }

  /**
   * Get service account by API key
   */
  async getServiceAccountByApiKey(apiKey: string): Promise<ServiceAccount | null> {
    for (const account of this.accounts.values()) {
      const valid = await bcrypt.compare(apiKey, account.apiKeyHash);
      if (valid && account.enabled) {
        return account;
      }
    }
    return null;
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string): Promise<boolean> {
    const account = await this.getServiceAccountByApiKey(apiKey);
    return account !== null && account.enabled;
  }

  /**
   * Rotate API key
   */
  async rotateApiKey(accountId: string): Promise<string> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Service account not found');
    }

    const newApiKey = this.generateApiKey();
    const newApiKeyHash = await bcrypt.hash(newApiKey, BCRYPT_ROUNDS);

    account.apiKeyHash = newApiKeyHash;
    account.updatedAt = new Date();

    return newApiKey;
  }

  /**
   * Enable/disable service account
   */
  async setEnabled(accountId: string, enabled: boolean): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Service account not found');
    }

    account.enabled = enabled;
    account.updatedAt = new Date();
  }

  /**
   * Generate secure API key
   */
  private generateApiKey(): string {
    const prefix = 'crai';
    const entropy = randomUUID().replace(/-/g, '');
    return `${prefix}_${entropy}`;
  }
}

// Export singleton instance
export const serviceAccountManager = new ServiceAccountManager();

/**
 * Initialize Javari AI service account
 */
export async function initializeJavariServiceAccount(): Promise<ServiceAccount> {
  const javariAccount = await serviceAccountManager.createServiceAccount({
    email: 'javari@craudiovizai.com',
    name: 'Javari AI',
    description: 'Primary AI assistant service account with super_admin privileges',
    roles: [SUPER_ADMIN_ROLE],
    allowedOrigins: ['*'],
    rateLimit: 10000, // Higher rate limit for AI operations
  });

  console.log('✅ Javari AI service account initialized');
  console.log(`   ID: ${javariAccount.id}`);
  console.log(`   API Key: ${javariAccount.apiKey}`);
  console.log(`   Roles: ${javariAccount.roles.join(', ')}`);
  
  return javariAccount;
}
