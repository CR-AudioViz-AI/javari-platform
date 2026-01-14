/**
 * Multi-AI Orchestrator - Generation Types
 * Phase A: Foundation Layer
 */

export type GenerationPriority = 'low' | 'normal' | 'high' | 'critical';

export type GenerationStatus = 
  | 'pending'
  | 'approved' 
  | 'requires_approval'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationMetadata {
  requestId: string;
  userId: string;
  timestamp: Date;
  priority: GenerationPriority;
  tags?: string[];
  context?: Record<string, unknown>;
}

export interface GenerationResult {
  requestId: string;
  status: GenerationStatus;
  provider: string;
  model: string;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costUSD?: number;
  latencyMs?: number;
  completedAt?: Date;
}
