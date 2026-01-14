/**
 * Credit Engine
 * Phase H: Complete credit management system
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface CreditBalance {
  userId: string;
  communityId?: string;
  planId: string;
  creditsAvailable: number;
  creditsUsed: number;
}

export interface CreditTransaction {
  userId: string;
  communityId?: string;
  delta: number;
  reason: string;
  workflowId?: string;
  costUSD?: number;
}

// Conversion rate: 1 credit = $0.01 USD
const CREDIT_TO_USD_RATE = 0.01;

export class CreditEngine {
  /**
   * Get user credit balance
   */
  async getUserCredits(userId: string, communityId?: string): Promise<number> {
    if (!isSupabaseConfigured()) return 999999; // Unlimited in dev

    try {
      const client = db['supabase'];
      if (!client) return 999999;

      const query = client
        .from('credit_balances')
        .select('credits_available')
        .eq('user_id', userId);

      if (communityId) {
        query.eq('community_id', communityId);
      }

      const { data, error } = await query.single();

      if (error) {
        // No balance found, return 0
        return 0;
      }

      return parseFloat(data?.credits_available || '0');
    } catch (error) {
      console.error('[Credits] Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Get community credit balance
   */
  async getCommunityCredits(communityId: string): Promise<number> {
    // Community credits are sum of all member credits
    return this.getUserCredits('community', communityId);
  }

  /**
   * Convert USD cost to credits
   */
  convertCostToCredits(costUSD: number): number {
    return Math.ceil(costUSD / CREDIT_TO_USD_RATE);
  }

  /**
   * Convert credits to USD
   */
  convertCreditsToUSD(credits: number): number {
    return credits * CREDIT_TO_USD_RATE;
  }

  /**
   * Validate user has sufficient credits
   */
  async validateHasCredits(
    userId: string,
    communityId: string | undefined,
    creditsNeeded: number
  ): Promise<boolean> {
    const available = await this.getUserCredits(userId, communityId);
    return available >= creditsNeeded;
  }

  /**
   * Consume credits (atomic)
   */
  async consumeCredits(transaction: CreditTransaction): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('[Credits] Consumed (dev mode):', transaction);
      return true;
    }

    try {
      const client = db['supabase'];
      if (!client) return false;

      // Use database function for atomic transaction
      const { data, error } = await client.rpc('consume_credits', {
        p_user_id: transaction.userId,
        p_community_id: transaction.communityId || null,
        p_amount: transaction.delta,
        p_reason: transaction.reason,
        p_workflow_id: transaction.workflowId || null,
        p_cost_usd: transaction.costUSD || null,
      });

      if (error) throw error;

      return data === true;
    } catch (error) {
      console.error('[Credits] Failed to consume:', error);
      return false;
    }
  }

  /**
   * Add credits
   */
  async addCredits(
    userId: string,
    communityId: string | undefined,
    amount: number,
    reason: string
  ): Promise<number> {
    if (!isSupabaseConfigured()) {
      console.log('[Credits] Added (dev mode):', { userId, amount, reason });
      return amount;
    }

    try {
      const client = db['supabase'];
      if (!client) return 0;

      const { data, error } = await client.rpc('add_credits', {
        p_user_id: userId,
        p_community_id: communityId || null,
        p_amount: amount,
        p_reason: reason,
      });

      if (error) throw error;

      return parseFloat(data || '0');
    } catch (error) {
      console.error('[Credits] Failed to add:', error);
      return 0;
    }
  }

  /**
   * Get plan for user
   */
  async getPlanForUser(userId: string): Promise<string> {
    if (!isSupabaseConfigured()) return 'free';

    try {
      const client = db['supabase'];
      if (!client) return 'free';

      const { data, error } = await client
        .from('credit_balances')
        .select('plan_id')
        .eq('user_id', userId)
        .single();

      if (error) return 'free';

      return data?.plan_id || 'free';
    } catch (error) {
      return 'free';
    }
  }

  /**
   * Forecast credit burn rate
   */
  async forecastCreditBurn(userId: string, days: number): Promise<{
    currentBalance: number;
    avgDailyBurn: number;
    projectedBalance: number;
    daysUntilEmpty: number;
  }> {
    const currentBalance = await this.getUserCredits(userId);

    // Get usage from last 30 days
    if (!isSupabaseConfigured()) {
      return {
        currentBalance,
        avgDailyBurn: 10,
        projectedBalance: currentBalance - (10 * days),
        daysUntilEmpty: currentBalance / 10,
      };
    }

    try {
      const client = db['supabase'];
      if (!client) throw new Error('No client');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await client
        .from('credit_ledger')
        .select('delta')
        .eq('user_id', userId)
        .lt('delta', 0) // Only consumption
        .gte('timestamp', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const totalBurn = data.reduce((sum, row) => sum + Math.abs(parseFloat(row.delta)), 0);
      const avgDailyBurn = totalBurn / 30;
      const projectedBalance = currentBalance - (avgDailyBurn * days);
      const daysUntilEmpty = avgDailyBurn > 0 ? currentBalance / avgDailyBurn : Infinity;

      return {
        currentBalance,
        avgDailyBurn,
        projectedBalance,
        daysUntilEmpty,
      };
    } catch (error) {
      console.error('[Credits] Forecast failed:', error);
      return {
        currentBalance,
        avgDailyBurn: 0,
        projectedBalance: currentBalance,
        daysUntilEmpty: Infinity,
      };
    }
  }
}

// Singleton instance
export const creditEngine = new CreditEngine();
