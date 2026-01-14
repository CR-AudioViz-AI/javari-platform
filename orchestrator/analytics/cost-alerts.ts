/**
 * Multi-AI Orchestrator - Cost Alerts
 * Phase E: Anomaly detection and threshold alerts
 */

import { db, isSupabaseConfigured } from '../db/client';
import { costAnalyticsEngine } from './cost-engine';

export interface CostAlert {
  id?: string;
  alertType: 'threshold' | 'anomaly' | 'drift' | 'spike';
  severity: 'info' | 'warning' | 'critical';
  provider?: string;
  workflowId?: string;
  userId?: string;
  thresholdValue?: number;
  actualValue?: number;
  message: string;
  metadata?: any;
  resolved?: boolean;
}

export class CostAlertsSystem {
  private thresholds = {
    dailyCostLimit: 50.0,
    workflowCostLimit: 10.0,
    providerDriftPercent: 30,
    anomalyThreshold: 2.0, // 2x historical average
  };

  /**
   * Check for cost anomalies and create alerts
   */
  async checkCostAnomalies(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    // Check daily spend
    const dailyAlert = await this.checkDailySpend();
    if (dailyAlert) alerts.push(dailyAlert);

    // Check provider drift
    const driftAlerts = await this.checkProviderDrift();
    alerts.push(...driftAlerts);

    // Persist alerts if Supabase configured
    if (isSupabaseConfigured() && alerts.length > 0) {
      await this.persistAlerts(alerts);
    }

    return alerts;
  }

  /**
   * Check if daily spend exceeds threshold
   */
  private async checkDailySpend(): Promise<CostAlert | null> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const summary = await costAnalyticsEngine.getTotalSpend(oneDayAgo, now);
    
    if (summary.totalSpend > this.thresholds.dailyCostLimit) {
      return {
        alertType: 'threshold',
        severity: 'warning',
        thresholdValue: this.thresholds.dailyCostLimit,
        actualValue: summary.totalSpend,
        message: `Daily cost of $${summary.totalSpend.toFixed(2)} exceeds threshold of $${this.thresholds.dailyCostLimit}`,
        metadata: { requestCount: summary.requestCount },
      };
    }

    return null;
  }

  /**
   * Check for provider cost drift
   */
  private async checkProviderDrift(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentProviders = await costAnalyticsEngine.getProviderBreakdown(sevenDaysAgo, now);
    const priorProviders = await costAnalyticsEngine.getProviderBreakdown(fourteenDaysAgo, sevenDaysAgo);

    for (const recent of recentProviders) {
      const prior = priorProviders.find(p => p.provider === recent.provider);
      if (!prior) continue;

      const percentChange = ((recent.avgCost - prior.avgCost) / prior.avgCost) * 100;

      if (Math.abs(percentChange) > this.thresholds.providerDriftPercent) {
        alerts.push({
          alertType: 'drift',
          severity: percentChange > 0 ? 'warning' : 'info',
          provider: recent.provider,
          thresholdValue: prior.avgCost,
          actualValue: recent.avgCost,
          message: `Provider ${recent.provider} cost ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}%`,
          metadata: { priorAvg: prior.avgCost, currentAvg: recent.avgCost },
        });
      }
    }

    return alerts;
  }

  /**
   * Persist alerts to database
   */
  private async persistAlerts(alerts: CostAlert[]): Promise<void> {
    try {
      const client = db['supabase'];
      if (!client) return;

      for (const alert of alerts) {
        await client.from('ai_cost_alerts').insert({
          alert_type: alert.alertType,
          severity: alert.severity,
          provider: alert.provider,
          workflow_id: alert.workflowId,
          user_id: alert.userId,
          threshold_value: alert.thresholdValue,
          actual_value: alert.actualValue,
          message: alert.message,
          metadata: alert.metadata || {},
        });
      }
    } catch (error) {
      console.error('[CostAlerts] Failed to persist alerts:', error);
    }
  }

  /**
   * Get recent unresolved alerts
   */
  async getUnresolvedAlerts(limit: number = 50): Promise<CostAlert[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const client = db['supabase'];
      if (!client) return [];

      const { data, error } = await client
        .from('ai_cost_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        alertType: row.alert_type,
        severity: row.severity,
        provider: row.provider,
        workflowId: row.workflow_id,
        userId: row.user_id,
        thresholdValue: row.threshold_value ? parseFloat(row.threshold_value) : undefined,
        actualValue: row.actual_value ? parseFloat(row.actual_value) : undefined,
        message: row.message,
        metadata: row.metadata,
        resolved: row.resolved,
      }));
    } catch (error) {
      console.error('[CostAlerts] Failed to get alerts:', error);
      return [];
    }
  }
}

// Singleton instance
export const costAlertsSystem = new CostAlertsSystem();
