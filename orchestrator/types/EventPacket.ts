/**
 * EventPacket Type Definition
 * Standard structure for system events across orchestrator
 * 
 * Stack: CRAudioVizAI Orchestrator
 */

export type EventSource = 
  | 'orchestrator'
  | 'github_webhook'
  | 'javari_chat'
  | 'javari_background'
  | 'javari_cron'
  | 'claude_api'
  | 'chatgpt_api'
  | 'manual';

export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Event type categories
 */
export type EventType =
  // Task lifecycle events
  | 'task_created'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'task_cancelled'
  
  // GitHub webhook events
  | 'github_push'
  | 'github_pull_request'
  | 'github_issue'
  | 'github_release'
  
  // Javari platform events
  | 'javari_user_query'
  | 'javari_knowledge_gap'
  | 'javari_error_detected'
  | 'javari_learning_opportunity'
  
  // Knowledge base events
  | 'knowledge_updated'
  | 'knowledge_expired'
  | 'embedding_created'
  
  // System events
  | 'system_error'
  | 'api_rate_limit'
  | 'deployment_triggered'
  | 'health_check';

/**
 * Core event packet structure
 * All events emitted in the system must conform to this interface
 */
export interface EventPacket {
  // Unique event identifier
  id: string;
  
  // Event classification
  eventType: EventType;
  source: EventSource;
  priority?: EventPriority;
  
  // Event data (flexible structure based on event type)
  eventData: Record<string, unknown>;
  
  // Timestamp
  timestamp: string; // ISO 8601
  
  // Relationships
  taskId?: string;
  userId?: string;
  sessionId?: string;
  parentEventId?: string;
  
  // Metadata
  metadata?: {
    environment?: 'development' | 'staging' | 'production';
    version?: string;
    tags?: string[];
    correlationId?: string;
    [key: string]: unknown;
  };
}

/**
 * Event creation request (subset of EventPacket)
 */
export interface CreateEventRequest {
  eventType: EventType;
  source: EventSource;
  priority?: EventPriority;
  eventData: Record<string, unknown>;
  taskId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: EventPacket['metadata'];
}

/**
 * Event query filters
 */
export interface EventQueryFilters {
  eventType?: EventType | EventType[];
  source?: EventSource | EventSource[];
  priority?: EventPriority | EventPriority[];
  timestampAfter?: string; // ISO 8601
  timestampBefore?: string; // ISO 8601
  taskId?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Event stream subscription options
 */
export interface EventStreamOptions {
  filters?: EventQueryFilters;
  includeHistorical?: boolean;
  batchSize?: number;
  pollIntervalMs?: number;
}

/**
 * Event aggregation result
 */
export interface EventAggregation {
  timeRange: {
    start: string;
    end: string;
  };
  eventCount: number;
  byType: Record<EventType, number>;
  bySource: Record<EventSource, number>;
  byPriority?: Record<EventPriority, number>;
}

/**
 * GitHub-specific event data structures
 */
export interface GitHubPushEventData {
  repository: string;
  branch: string;
  commits: Array<{
    id: string;
    message: string;
    author: string;
  }>;
  pusher: string;
}

export interface GitHubPullRequestEventData {
  action: 'opened' | 'closed' | 'reopened' | 'synchronize';
  pullRequest: {
    number: number;
    title: string;
    state: string;
    author: string;
  };
  repository: string;
}

/**
 * Javari-specific event data structures
 */
export interface JavariUserQueryEventData {
  query: string;
  userId?: string;
  sessionId: string;
  responseGenerated: boolean;
  knowledgeGapDetected?: boolean;
}

export interface JavariKnowledgeGapEventData {
  query: string;
  missingTopic: string;
  confidence: number;
  suggestedSources?: string[];
}

/**
 * Knowledge base event data structures
 */
export interface KnowledgeUpdatedEventData {
  source: string;
  category: string;
  chunksAdded: number;
  totalEmbeddings: number;
  updateType: 'new' | 'version' | 'correction';
}

// TODO: Add event schema validation
// TODO: Add event replay functionality
// TODO: Add event-sourcing utilities
// TODO: Add event correlation tracking
