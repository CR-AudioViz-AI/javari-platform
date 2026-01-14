/**
 * Multi-AI Orchestrator - Persistent Audit Logger
 * Phase C: Supabase-backed audit logging
 */

import crypto from 'crypto';
import type { AuditLogEntry as AuditLogType } from '../types/audit-log';
import { db, isSupabaseConfigured } from '../db/client';

export class AuditLogger {
  private inMemoryFallback: AuditLogType[] = [];
  private readonly maxInMemory = 1000;

  /**
   * Log an audit event to Supabase (with in-memory fallback)
   */
  async logEvent(event: AuditLogType): Promise<string | null> {
    // Generate stable request hash for caching/deduplication
    const inputHash = this.generateRequestHash(event);

    const entry = {
      event_id: event.eventId,
      event_type: event.eventType,
      timestamp: event.timestamp,
      user_id: event.userId,
      request_id: event.requestId,
      provider: event.provider,
      model: event.model,
      input_hash: inputHash,
      tokens_in: this.extractTokens(event, 'input'),
      tokens_out: this.extractTokens(event, 'output'),
      total_tokens: this.extractTokens(event, 'total'),
      latency_ms: event.latencyMs,
      cost_usd: event.costUSD,
      routing_decision: event.metadata?.routingReason,
      fallback_used: event.metadata?.fallbackUsed || false,
      status: event.status,
      error: event.error,
      request_body: event.metadata?.requestBody,
      response_body: event.metadata?.responseBody,
      metadata: event.metadata,
    };

    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const result = await db.auditLog.insert(entry);
        
        // Also insert into cost ledger if this is a generation event with cost
        if (event.eventType === 'generation_completed' && event.costUSD && event.provider) {
          await this.insertCostLedger(event);
        }
        
        return result?.id || null;
      } catch (error) {
        console.error('[AuditLogger] Failed to write to Supabase:', error);
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    this.inMemoryFallback.push(event);
    if (this.inMemoryFallback.length > this.maxInMemory) {
      this.inMemoryFallback.shift();
    }

    // Also log to console for debugging
    console.log('[AUDIT]', {
      eventType: event.eventType,
      provider: event.provider,
      cost: event.costUSD,
      latency: event.latencyMs,
    });

    return null;
  }

  /**
   * Insert cost ledger entry with anomaly detection
   */
  private async insertCostLedger(event: AuditLogType): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const client = db['supabase'];
      if (!client) return;

      const tokensIn = this.extractTokens(event, 'input') || 0;
      const tokensOut = this.extractTokens(event, 'output') || 0;

      // Detect anomaly (cost >2x historical average)
      let anomalyFlag = false;
      try {
        const { data: avgData } = await client
          .from('ai_cost_ledger')
          .select('cost_usd')
          .eq('provider', event.provider)
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (avgData && avgData.length > 0) {
          const avgCost = avgData.reduce((sum, r) => sum + parseFloat(r.cost_usd || '0'), 0) / avgData.length;
          anomalyFlag = (event.costUSD || 0) > avgCost * 2;
        }
      } catch (error) {
        // Ignore anomaly detection errors
      }

      await client.from('ai_cost_ledger').insert({
        provider: event.provider,
        model: event.model || 'unknown',
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_usd: event.costUSD,
        workflow_id: event.metadata?.workflowId,
        workflow_name: event.metadata?.workflowName,
        user_id: event.userId,
        cache_hit: event.metadata?.cached || false,
        fallback_used: event.metadata?.fallbackUsed || false,
        anomaly_flag: anomalyFlag,
        metadata: {
          requestId: event.requestId,
          latencyMs: event.latencyMs,
        },
      });
    } catch (error) {
      console.error('[AuditLogger] Failed to insert cost ledger:', error);
    }
  }

  /**
   * Generate stable hash for request deduplication
   */
  private generateRequestHash(event: AuditLogType): string {
    if (!event.metadata?.requestBody) return '';

    const { prompt, systemPrompt, temperature, maxTokens } = event.metadata.requestBody;
    const hashInput = JSON.stringify({
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      provider: event.provider,
      model: event.model,
    });

    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Extract token counts from event metadata
   */
  private extractTokens(event: AuditLogType, type: 'input' | 'output' | 'total'): number | undefined {
    const usage = event.metadata?.usage;
    if (!usage) return undefined;

    switch (type) {
      case 'input':
        return usage.promptTokens;
      case 'output':
        return usage.completionTokens;
      case 'total':
        return usage.totalTokens;
    }
  }

  /**
   * Query audit logs
   */
  async queryLogs(filters: {
    userId?: string;
    provider?: string;
    eventType?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogType[]> {
    if (isSupabaseConfigured()) {
      try {
        const results = await db.auditLog.query(filters);
        return results.map(this.mapFromDb);
      } catch (error) {
        console.error('[AuditLogger] Query failed:', error);
        return this.queryInMemory(filters);
      }
    }

    return this.queryInMemory(filters);
  }

  /**
   * Query in-memory fallback
   */
  private queryInMemory(filters: {
    userId?: string;
    provider?: string;
    eventType?: string;
    limit?: number;
  }): AuditLogType[] {
    let results = [...this.inMemoryFallback];

    if (filters.userId) {
      results = results.filter(e => e.userId === filters.userId);
    }

    if (filters.provider) {
      results = results.filter(e => e.provider === filters.provider);
    }

    if (filters.eventType) {
      results = results.filter(e => e.eventType === filters.eventType);
    }

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Map database entry to audit log type
   */
  private mapFromDb(dbEntry: any): AuditLogType {
    return {
      eventId: dbEntry.event_id,
      eventType: dbEntry.event_type,
      timestamp: new Date(dbEntry.timestamp),
      userId: dbEntry.user_id,
      requestId: dbEntry.request_id,
      provider: dbEntry.provider,
      model: dbEntry.model,
      latencyMs: dbEntry.latency_ms,
      costUSD: dbEntry.cost_usd ? parseFloat(dbEntry.cost_usd) : undefined,
      status: dbEntry.status,
      error: dbEntry.error,
      metadata: dbEntry.metadata,
    };
  }

  /**
   * Get in-memory logs (for testing/debugging)
   */
  getInMemoryLogs(): AuditLogType[] {
    return [...this.inMemoryFallback];
  }

  /**
   * Clear in-memory logs
   */
  clearInMemoryLogs(): void {
    this.inMemoryFallback = [];
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByProvider: Record<string, number>;
    totalCost: number;
  }> {
    const logs = isSupabaseConfigured() 
      ? await this.queryLogs({ limit: 1000 })
      : this.getInMemoryLogs();

    const stats = {
      totalEvents: logs.length,
      eventsByType: {} as Record<string, number>,
      eventsByProvider: {} as Record<string, number>,
      totalCost: 0,
    };

    for (const log of logs) {
      stats.eventsByType[log.eventType] = (stats.eventsByType[log.eventType] || 0) + 1;
      if (log.provider) {
        stats.eventsByProvider[log.provider] = (stats.eventsByProvider[log.provider] || 0) + 1;
      }
      if (log.costUSD) {
        stats.totalCost += log.costUSD;
      }
    }

    return stats;
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

// Helper function
export async function logAuditEvent(event: AuditLogType): Promise<string | null> {
  return auditLogger.logEvent(event);
}
