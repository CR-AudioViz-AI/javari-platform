/**
 * Multi-AI Orchestrator - Audit Log Stub
 * Phase A: Foundation Layer
 * 
 * Temporary stub for audit logging. In Phase A, logs go to console.
 * In future phases, this will be replaced with persistent storage.
 */

import type { AuditLogEntry, AuditLogQuery, AuditLogResult } from '../types/audit-log';

export class AuditLogStub {
  private logs: AuditLogEntry[] = [];
  private readonly maxInMemoryLogs = 1000;

  /**
   * Log an audit event (Phase A: console only)
   */
  async logAuditEvent(event: AuditLogEntry): Promise<void> {
    // Log to console
    console.log('[AUDIT]', {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      provider: event.provider,
      requestId: event.requestId,
      status: event.status,
      costUSD: event.costUSD,
      latencyMs: event.latencyMs,
      error: event.error,
    });

    // Keep in memory for testing (with size limit)
    this.logs.push(event);
    if (this.logs.length > this.maxInMemoryLogs) {
      this.logs.shift(); // Remove oldest
    }

    // TODO Phase B: Persist to Supabase
    // await supabase.from('audit_logs').insert(event)
  }

  /**
   * Query audit logs (Phase A: in-memory only)
   */
  async queryLogs(query: AuditLogQuery = {}): Promise<AuditLogResult> {
    let filtered = [...this.logs];

    // Apply filters
    if (query.userId) {
      filtered = filtered.filter(log => log.userId === query.userId);
    }

    if (query.eventType) {
      filtered = filtered.filter(log => log.eventType === query.eventType);
    }

    if (query.provider) {
      filtered = filtered.filter(log => log.provider === query.provider);
    }

    if (query.startDate) {
      filtered = filtered.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filtered = filtered.filter(log => log.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      entries: paginated,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get all logs (for testing)
   */
  getAllLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all in-memory logs (for testing)
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log statistics
   */
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByProvider: Record<string, number>;
    totalCost: number;
  } {
    const stats = {
      totalEvents: this.logs.length,
      eventsByType: {} as Record<string, number>,
      eventsByProvider: {} as Record<string, number>,
      totalCost: 0,
    };

    for (const log of this.logs) {
      // Count by type
      stats.eventsByType[log.eventType] = (stats.eventsByType[log.eventType] || 0) + 1;

      // Count by provider
      if (log.provider) {
        stats.eventsByProvider[log.provider] = (stats.eventsByProvider[log.provider] || 0) + 1;
      }

      // Sum costs
      if (log.costUSD) {
        stats.totalCost += log.costUSD;
      }
    }

    return stats;
  }
}

/**
 * Singleton instance for Phase A
 */
export const auditLog = new AuditLogStub();

/**
 * Helper function for logging audit events
 */
export function logAuditEvent(event: AuditLogEntry): void {
  auditLog.logAuditEvent(event);
}
