/**
 * Multi-AI Orchestrator - Audit Log Types
 * Phase A: Foundation Layer
 */

export type AuditEventType = 
  | 'generation_requested'
  | 'generation_approved'
  | 'generation_denied'
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'health_check'
  | 'cost_threshold_exceeded'
  | 'rate_limit_exceeded';

export interface AuditLogEntry {
  eventId: string;
  eventType: AuditEventType;
  timestamp: Date;
  userId: string;
  provider?: string;
  model?: string;
  requestId?: string;
  status?: string;
  costUSD?: number;
  latencyMs?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogQuery {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  eventType?: AuditEventType;
  provider?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResult {
  entries: AuditLogEntry[];
  total: number;
  hasMore: boolean;
}
