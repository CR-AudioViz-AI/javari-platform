/**
 * Audit Log Stub (Phase A)
 * Placeholder audit logging - console only
 */

import type { AuditLogEntry } from '../types/audit-log';

/**
 * Log audit event (Phase A - console only)
 * In Phase B, this will persist to database
 */
export function logAuditEvent(event: AuditLogEntry): void {
  console.log('='.repeat(60));
  console.log('AUDIT LOG EVENT');
  console.log('='.repeat(60));
  console.log(JSON.stringify(event, null, 2));
  console.log('='.repeat(60));
}

/**
 * Get audit events (Phase A - not implemented)
 */
export async function getAuditEvents(
  userId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  console.warn('getAuditEvents not implemented in Phase A');
  return [];
}
