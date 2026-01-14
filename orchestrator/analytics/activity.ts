/**
 * Community Activity Tracking
 * Phase G: Activity feed and logging
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface ActivityEvent {
  communityId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export class ActivityTracker {
  /**
   * Record workflow run
   */
  async recordWorkflowRun(
    communityId: string,
    userId: string,
    workflowId: string,
    workflowName: string,
    cost: number
  ): Promise<void> {
    await this.logActivity({
      communityId,
      userId,
      action: 'workflow_run',
      entityType: 'workflow',
      entityId: workflowId,
      metadata: {
        workflowName,
        cost,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Record content creation
   */
  async recordContentCreation(
    communityId: string,
    userId: string,
    tool: string,
    contentId: string
  ): Promise<void> {
    await this.logActivity({
      communityId,
      userId,
      action: 'content_created',
      entityType: 'content',
      entityId: contentId,
      metadata: {
        tool,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Record export
   */
  async recordExport(
    communityId: string,
    userId: string,
    tool: string,
    fileType: string
  ): Promise<void> {
    await this.logActivity({
      communityId,
      userId,
      action: 'content_exported',
      entityType: 'export',
      metadata: {
        tool,
        fileType,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Record member action
   */
  async recordMemberAction(
    communityId: string,
    userId: string,
    action: string,
    targetUserId?: string
  ): Promise<void> {
    await this.logActivity({
      communityId,
      userId,
      action,
      entityType: 'member',
      metadata: {
        targetUserId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log activity to database
   */
  private async logActivity(event: ActivityEvent): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('[Activity]', event);
      return;
    }

    try {
      const client = db['supabase'];
      if (!client) return;

      await client.from('activity_log').insert({
        community_id: event.communityId,
        user_id: event.userId,
        action: event.action,
        entity_type: event.entityType,
        entity_id: event.entityId,
        metadata: event.metadata || {},
      });
    } catch (error) {
      console.error('[Activity] Failed to log:', error);
    }
  }

  /**
   * Get activity for community
   */
  async getActivityForCommunity(
    communityId: string,
    limit: number = 50
  ): Promise<any[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const client = db['supabase'];
      if (!client) return [];

      const { data, error } = await client
        .from('activity_log')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[Activity] Failed to fetch:', error);
      return [];
    }
  }
}

// Singleton instance
export const activityTracker = new ActivityTracker();
