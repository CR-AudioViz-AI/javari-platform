/**
 * TaskEnvelope Type Definition
 * Standard structure for AI task routing across orchestrator system
 * 
 * Stack: CRAudioVizAI Orchestrator
 */

export type TaskType = 
  | 'code_generation'
  | 'documentation'
  | 'analysis'
  | 'deployment'
  | 'research'
  | 'review';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AIAgent = 'claude' | 'chatgpt' | 'javari';

/**
 * Core task envelope structure
 * All tasks routed through the orchestrator must conform to this interface
 */
export interface TaskEnvelope {
  // Unique task identifier
  id: string;
  
  // Task classification
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Agent assignment
  assignedAgent: AIAgent;
  
  // Task payload
  payload: {
    description: string;
    context?: Record<string, unknown>;
    systemPrompt?: string;
    requiresApproval?: boolean;
    maxRetries?: number;
  };
  
  // Results
  result?: {
    content: unknown;
    raw?: unknown;
    metadata?: Record<string, unknown>;
  };
  
  // Error tracking
  error?: {
    message: string;
    code?: string;
    stack?: string;
    retryable?: boolean;
  };
  
  // Timestamps
  createdAt: string; // ISO 8601
  startedAt?: string;
  completedAt?: string;
  
  // Performance metrics
  executionTimeMs?: number;
  apiCostCents?: number;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  
  // Relationships
  parentTaskId?: string;
  childTaskIds?: string[];
  triggeredByEventId?: string;
  
  // Metadata
  metadata?: {
    source?: string;
    userId?: string;
    sessionId?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

/**
 * Task creation request (subset of TaskEnvelope)
 */
export interface CreateTaskRequest {
  taskType: TaskType;
  priority: TaskPriority;
  payload: TaskEnvelope['payload'];
  assignedAgent?: AIAgent; // Optional - can be auto-determined
  parentTaskId?: string;
  metadata?: TaskEnvelope['metadata'];
}

/**
 * Task update payload
 */
export interface UpdateTaskPayload {
  status?: TaskStatus;
  result?: TaskEnvelope['result'];
  error?: TaskEnvelope['error'];
  executionTimeMs?: number;
  apiCostCents?: number;
  tokensUsed?: TaskEnvelope['tokensUsed'];
}

/**
 * Task query filters
 */
export interface TaskQueryFilters {
  taskType?: TaskType | TaskType[];
  status?: TaskStatus | TaskStatus[];
  assignedAgent?: AIAgent | AIAgent[];
  priority?: TaskPriority | TaskPriority[];
  createdAfter?: string; // ISO 8601
  createdBefore?: string; // ISO 8601
  parentTaskId?: string;
  userId?: string;
}

/**
 * Task statistics aggregation
 */
export interface TaskStatistics {
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  byAgent: Record<AIAgent, number>;
  byType: Record<TaskType, number>;
  averageExecutionTimeMs: number;
  totalApiCostCents: number;
  successRate: number;
}

// TODO: Add validation schemas using Zod or similar
// TODO: Add task priority queue logic
// TODO: Add task dependency graph utilities
// TODO: Add task retry policy definitions
