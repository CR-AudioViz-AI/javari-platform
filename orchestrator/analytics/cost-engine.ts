/**
 * Multi-AI Orchestrator - Cost Analytics Engine
 * Phase E: Comprehensive cost intelligence
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface CostSummary {
  totalSpend: number;
  requestCount: number;
  avgCostPerRequest: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface ProviderCostBreakdown {
  provider: string;
  totalCost: number;
  requestCount: number;
  avgCost: number;
  percentage: number;
}

export interface WorkflowCostStats {
  workflowId: string;
  workflowName: string;
  totalCost: number;
  runCount: number;
  avgCostPerRun: number;
}

export interface CacheSavings {
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  estimatedSavings: number;
}

export interface CostCurve {
  timestamp: Date;
  cost: number;
  cumulativeCost: number;
}

export class CostAnalyticsEngine {
  /**
   * Get total spend for a time range
   */
  async getTotalSpend(startTime: Date, endTime: Date): Promise<CostSummary> {
    if (!isSupabaseConfigured()) {
      return {
        totalSpend: 0,
        requestCount: 0,
        avgCostPerRequest: 0,
        periodStart: startTime,
        periodEnd: endTime,
      };
    }

    try {
      const client = db['supabase'];
      if (!client) throw new Error('Supabase not configured');

      const { data, error } = await client
        .from('ai_cost_ledger')
        .select('cost_usd')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString());

      if (error) throw error;

      const totalSpend = data.reduce((sum, row) => sum + parseFloat(row.cost_usd || '0'), 0);
      const requestCount = data.length;

      return {
        totalSpend,
        requestCount,
        avgCostPerRequest: requestCount > 0 ? totalSpend / requestCount : 0,
        periodStart: startTime,
        periodEnd: endTime,
      };
    } catch (error) {
      console.error('[CostEngine] getTotalSpend failed:', error);
      throw error;
    }
  }

  /**
   * Get provider cost breakdown
   */
  async getProviderBreakdown(startTime: Date, endTime: Date): Promise<ProviderCostBreakdown[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const client = db['supabase'];
      if (!client) throw new Error('Supabase not configured');

      const { data, error } = await client
        .from('ai_cost_ledger')
        .select('provider, cost_usd')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString());

      if (error) throw error;

      // Aggregate by provider
      const providerMap = new Map<string, { cost: number; count: number }>();
      
      for (const row of data) {
        const provider = row.provider;
        const cost = parseFloat(row.cost_usd || '0');
        
        if (!providerMap.has(provider)) {
          providerMap.set(provider, { cost: 0, count: 0 });
        }
        
        const stats = providerMap.get(provider)!;
        stats.cost += cost;
        stats.count += 1;
      }

      const totalCost = Array.from(providerMap.values()).reduce((sum, s) => sum + s.cost, 0);

      return Array.from(providerMap.entries())
        .map(([provider, stats]) => ({
          provider,
          totalCost: stats.cost,
          requestCount: stats.count,
          avgCost: stats.cost / stats.count,
          percentage: totalCost > 0 ? (stats.cost / totalCost) * 100 : 0,
        }))
        .sort((a, b) => b.totalCost - a.totalCost);
    } catch (error) {
      console.error('[CostEngine] getProviderBreakdown failed:', error);
      return [];
    }
  }

  /**
   * Get workflow cost statistics
   */
  async getWorkflowCostStats(startTime: Date, endTime: Date): Promise<WorkflowCostStats[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const client = db['supabase'];
      if (!client) throw new Error('Supabase not configured');

      const { data, error } = await client
        .from('ai_cost_ledger')
        .select('workflow_id, workflow_name, cost_usd')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .not('workflow_id', 'is', null);

      if (error) throw error;

      // Aggregate by workflow
      const workflowMap = new Map<string, { name: string; cost: number; count: number }>();
      
      for (const row of data) {
        const id = row.workflow_id;
        const cost = parseFloat(row.cost_usd || '0');
        
        if (!workflowMap.has(id)) {
          workflowMap.set(id, { name: row.workflow_name || 'Unknown', cost: 0, count: 0 });
        }
        
        const stats = workflowMap.get(id)!;
        stats.cost += cost;
        stats.count += 1;
      }

      return Array.from(workflowMap.entries())
        .map(([workflowId, stats]) => ({
          workflowId,
          workflowName: stats.name,
          totalCost: stats.cost,
          runCount: stats.count,
          avgCostPerRun: stats.cost / stats.count,
        }))
        .sort((a, b) => b.totalCost - a.totalCost);
    } catch (error) {
      console.error('[CostEngine] getWorkflowCostStats failed:', error);
      return [];
    }
  }

  /**
   * Calculate cache savings
   */
  async getCacheSavings(startTime: Date, endTime: Date): Promise<CacheSavings> {
    if (!isSupabaseConfigured()) {
      return { cacheHits: 0, cacheMisses: 0, cacheHitRate: 0, estimatedSavings: 0 };
    }

    try {
      const client = db['supabase'];
      if (!client) throw new Error('Supabase not configured');

      const { data, error } = await client
        .from('ai_cost_ledger')
        .select('cache_hit, cost_usd')
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString());

      if (error) throw error;

      const cacheHits = data.filter(r => r.cache_hit).length;
      const cacheMisses = data.filter(r => !r.cache_hit).length;
      const total = cacheHits + cacheMisses;
      
      // Estimate savings (cache hits cost nothing)
      const avgCostPerRequest = cacheMisses > 0
        ? data.filter(r => !r.cache_hit).reduce((sum, r) => sum + parseFloat(r.cost_usd || '0'), 0) / cacheMisses
        : 0;
      
      const estimatedSavings = cacheHits * avgCostPerRequest;

      return {
        cacheHits,
        cacheMisses,
        cacheHitRate: total > 0 ? (cacheHits / total) * 100 : 0,
        estimatedSavings,
      };
    } catch (error) {
      console.error('[CostEngine] getCacheSavings failed:', error);
      return { cacheHits: 0, cacheMisses: 0, cacheHitRate: 0, estimatedSavings: 0 };
    }
  }

  /**
   * Get hourly burn rate
   */
  async getHourlyBurnRate(): Promise<number> {
    if (!isSupabaseConfigured()) return 0;

    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const now = new Date();
      
      const summary = await this.getTotalSpend(oneHourAgo, now);
      return summary.totalSpend;
    } catch (error) {
      console.error('[CostEngine] getHourlyBurnRate failed:', error);
      return 0;
    }
  }

  /**
   * Get daily cost curve (hourly data points)
   */
  async getDailyCostCurve(): Promise<CostCurve[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const client = db['supabase'];
      if (!client) throw new Error('Supabase not configured');

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await client
        .from('ai_cost_ledger')
        .select('timestamp, cost_usd')
        .gte('timestamp', oneDayAgo.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Group by hour
      const hourlyMap = new Map<string, number>();
      let cumulative = 0;

      for (const row of data) {
        const hour = new Date(row.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + parseFloat(row.cost_usd || '0'));
      }

      return Array.from(hourlyMap.entries())
        .map(([timestamp, cost]) => {
          cumulative += cost;
          return {
            timestamp: new Date(timestamp),
            cost,
            cumulativeCost: cumulative,
          };
        });
    } catch (error) {
      console.error('[CostEngine] getDailyCostCurve failed:', error);
      return [];
    }
  }

  /**
   * Get top cost drivers
   */
  async getTopCostDrivers(startTime: Date, endTime: Date, limit: number = 10): Promise<{
    type: 'provider' | 'workflow' | 'user';
    name: string;
    cost: number;
  }[]> {
    const providers = await this.getProviderBreakdown(startTime, endTime);
    const workflows = await this.getWorkflowCostStats(startTime, endTime);

    const drivers = [
      ...providers.slice(0, limit).map(p => ({ type: 'provider' as const, name: p.provider, cost: p.totalCost })),
      ...workflows.slice(0, limit).map(w => ({ type: 'workflow' as const, name: w.workflowName, cost: w.totalCost })),
    ];

    return drivers.sort((a, b) => b.cost - a.cost).slice(0, limit);
  }
}

// Singleton instance
export const costAnalyticsEngine = new CostAnalyticsEngine();
