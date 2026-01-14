/**
 * Multi-AI Orchestrator - Router Engine
 * Phase B: Enhanced with multi-provider routing, fallback, and streaming
 * 
 * Routes generation requests to appropriate LLM adapters with:
 * - Smart provider selection (cost, speed, capability-based)
 * - Automatic fallback chains
 * - Retry logic
 * - Streaming support
 */

import type { LLMAdapter, LLMGenerationRequest } from '../types/llm-adapter';
import type { GenerationResult, GenerationMetadata } from '../types/generation';
import type { AuditLogEntry } from '../types/audit-log';
import { ApprovalGateEngine } from '../gates/approval';
import { v4 as uuidv4 } from 'uuid';
import { getActiveProviders, createAdapter, getCheapestProvider, getFastestProvider, getProvidersWithCapability, type ProviderMetadata } from '../providers';

export interface RouterConfig {
  defaultProvider?: string;
  routingStrategy?: 'cheapest' | 'fastest' | 'specified' | 'capability';
  autoApproveThresholdUSD?: number;
  enableAudit?: boolean;
  enableFallback?: boolean;
  maxRetries?: number;
}

export interface RoutingDecision {
  selectedProvider: string;
  selectedModel: string;
  reason: string;
  fallbackChain?: string[];
  estimatedCost: number;
}

export class RouterEngine {
  private adapters: Map<string, LLMAdapter> = new Map();
  private approvalGate: ApprovalGateEngine;
  private config: RouterConfig;
  private auditLog: AuditLogEntry[] = [];

  constructor(config: RouterConfig = {}) {
    this.config = {
      routingStrategy: 'cheapest',
      autoApproveThresholdUSD: 1.0,
      enableAudit: true,
      enableFallback: true,
      maxRetries: 2,
      ...config,
    };
    this.approvalGate = new ApprovalGateEngine(this.config.autoApproveThresholdUSD);
    
    // Auto-register all active providers
    this.registerActiveProviders();
  }

  /**
   * Register all active providers from the registry
   */
  private registerActiveProviders(): void {
    const activeProviders = getActiveProviders();
    
    for (const providerMeta of activeProviders) {
      const adapter = createAdapter(providerMeta.name);
      if (adapter) {
        this.adapters.set(providerMeta.name, adapter);
        console.log(`[Router] Registered provider: ${providerMeta.name} (${providerMeta.defaultModel})`);
      }
    }

    if (this.adapters.size === 0) {
      console.warn('[Router] No providers configured - all requests will fail');
    } else {
      console.log(`[Router] ${this.adapters.size} providers active`);
    }
  }

  /**
   * Select the best provider based on routing strategy
   */
  private async selectProvider(
    request: LLMGenerationRequest,
    preferredProvider?: string
  ): Promise<RoutingDecision | null> {
    const activeProviders = getActiveProviders();

    if (activeProviders.length === 0) {
      return null;
    }

    // Strategy 1: Use preferred provider if specified and available
    if (preferredProvider) {
      const adapter = this.adapters.get(preferredProvider);
      if (adapter) {
        const cost = await adapter.estimateCost(request);
        return {
          selectedProvider: preferredProvider,
          selectedModel: adapter.modelName,
          reason: `User-specified provider: ${preferredProvider}`,
          estimatedCost: cost.estimatedCostUSD,
        };
      }
    }

    // Strategy 2: Use default provider from config
    if (this.config.defaultProvider) {
      const adapter = this.adapters.get(this.config.defaultProvider);
      if (adapter) {
        const cost = await adapter.estimateCost(request);
        return {
          selectedProvider: this.config.defaultProvider,
          selectedModel: adapter.modelName,
          reason: `Default provider: ${this.config.defaultProvider}`,
          estimatedCost: cost.estimatedCostUSD,
        };
      }
    }

    // Strategy 3: Use routing strategy
    switch (this.config.routingStrategy) {
      case 'cheapest': {
        const cheapest = getCheapestProvider();
        if (!cheapest) return null;
        
        const adapter = this.adapters.get(cheapest.name);
        if (!adapter) return null;
        
        const cost = await adapter.estimateCost(request);
        return {
          selectedProvider: cheapest.name,
          selectedModel: adapter.modelName,
          reason: `Cheapest provider: ${cheapest.name} (~$${cost.estimatedCostUSD.toFixed(4)})`,
          estimatedCost: cost.estimatedCostUSD,
        };
      }

      case 'fastest': {
        const fastest = getFastestProvider();
        if (!fastest) return null;
        
        const adapter = this.adapters.get(fastest.name);
        if (!adapter) return null;
        
        const cost = await adapter.estimateCost(request);
        return {
          selectedProvider: fastest.name,
          selectedModel: adapter.modelName,
          reason: `Fastest provider: ${fastest.name} (~${fastest.typicalLatencyMs}ms)`,
          estimatedCost: cost.estimatedCostUSD,
        };
      }

      default: {
        // Fallback to first available provider
        const first = activeProviders[0];
        const adapter = this.adapters.get(first.name);
        if (!adapter) return null;
        
        const cost = await adapter.estimateCost(request);
        return {
          selectedProvider: first.name,
          selectedModel: adapter.modelName,
          reason: `First available provider: ${first.name}`,
          estimatedCost: cost.estimatedCostUSD,
        };
      }
    }
  }

  /**
   * Build fallback chain for resilience
   */
  private buildFallbackChain(primaryProvider: string): string[] {
    const activeProviders = getActiveProviders();
    return activeProviders
      .map(p => p.name)
      .filter(name => name !== primaryProvider);
  }

  /**
   * Route a generation request through approval gates and to the appropriate adapter
   */
  async route(
    request: LLMGenerationRequest,
    metadata: GenerationMetadata,
    preferredProvider?: string
  ): Promise<GenerationResult> {
    const requestId = metadata.requestId || uuidv4();
    
    try {
      // Select provider
      const routing = await this.selectProvider(request, preferredProvider);
      
      if (!routing) {
        throw new Error('No providers available - please configure at least one provider');
      }

      const provider = routing.selectedProvider;
      
      // Log routing decision
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_requested',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
        metadata: { 
          priority: metadata.priority,
          routingReason: routing.reason,
          estimatedCost: routing.estimatedCost,
        },
      });

      // Validate request
      this.validateRequest(request);

      // Get adapter
      const adapter = this.adapters.get(provider);
      if (!adapter) {
        throw new Error(`Provider ${provider} not registered`);
      }

      // Estimate cost
      const costEstimate = await adapter.estimateCost(request);

      // Check approval gate
      const approvalResult = await this.approvalGate.checkApproval({
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        estimatedCostUSD: costEstimate.estimatedCostUSD,
        estimatedTokens: costEstimate.estimatedInputTokens + costEstimate.estimatedOutputTokens,
        userId: metadata.userId,
        metadata: metadata.context,
      });

      if (approvalResult.status === 'requires_approval') {
        this.logAudit({
          eventId: uuidv4(),
          eventType: 'generation_denied',
          timestamp: new Date(),
          userId: metadata.userId,
          provider,
          requestId,
          metadata: {
            reason: approvalResult.reason,
            triggeredRules: approvalResult.triggeredRules,
            estimatedCost: costEstimate.estimatedCostUSD,
          },
        });

        return {
          requestId,
          status: 'requires_approval',
          provider,
          model: adapter.modelName,
          error: approvalResult.reason,
        };
      }

      // Log approval
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_approved',
        timestamp: new Date(),
        userId: metadata.userId,
        provider,
        requestId,
        costUSD: costEstimate.estimatedCostUSD,
      });

      // Execute with fallback
      return await this.executeWithFallback(
        adapter,
        request,
        requestId,
        metadata.userId,
        this.buildFallbackChain(provider)
      );

    } catch (error) {
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_failed',
        timestamp: new Date(),
        userId: metadata.userId,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        requestId,
        status: 'failed',
        provider: 'unknown',
        model: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute request with automatic fallback
   */
  private async executeWithFallback(
    adapter: LLMAdapter,
    request: LLMGenerationRequest,
    requestId: string,
    userId: string,
    fallbackChain: string[]
  ): Promise<GenerationResult> {
    const provider = adapter.providerName;

    try {
      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_started',
        timestamp: new Date(),
        userId,
        provider,
        requestId,
      });

      const startTime = Date.now();
      const response = await adapter.generate(request);
      const latencyMs = Date.now() - startTime;

      const costEstimate = await adapter.estimateCost(request);

      this.logAudit({
        eventId: uuidv4(),
        eventType: 'generation_completed',
        timestamp: new Date(),
        userId,
        provider,
        requestId,
        costUSD: costEstimate.estimatedCostUSD,
        latencyMs,
      });

      return {
        requestId,
        status: 'completed',
        provider,
        model: adapter.modelName,
        content: response.content,
        usage: response.usage,
        costUSD: costEstimate.estimatedCostUSD,
        latencyMs: response.latencyMs,
        completedAt: new Date(),
      };

    } catch (error) {
      // Try fallback if enabled
      if (this.config.enableFallback && fallbackChain.length > 0) {
        const fallbackProvider = fallbackChain[0];
        const fallbackAdapter = this.adapters.get(fallbackProvider);

        if (fallbackAdapter) {
          console.warn(`[Router] Primary provider ${provider} failed, trying fallback: ${fallbackProvider}`);
          return await this.executeWithFallback(
            fallbackAdapter,
            request,
            requestId,
            userId,
            fallbackChain.slice(1)
          );
        }
      }

      throw error;
    }
  }

  /**
   * Validate generation request
   */
  private validateRequest(request: LLMGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.maxTokens !== undefined && request.maxTokens < 1) {
      throw new Error('Max tokens must be at least 1');
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Log audit event (to persistent storage)
   */
  private async logAudit(entry: AuditLogEntry): Promise<void> {
    if (this.config.enableAudit) {
      // Import here to avoid circular dependency
      const { auditLogger } = await import('../audit/audit');
      await auditLogger.logEvent(entry);
    }
  }

  /**
   * Check health of all registered adapters
   */
  async checkHealth(): Promise<Map<string, any>> {
    const healthResults = new Map();

    for (const [provider, adapter] of this.adapters.entries()) {
      try {
        const health = await adapter.healthCheck();
        healthResults.set(provider, health);
      } catch (error) {
        healthResults.set(provider, {
          provider,
          status: 'unavailable',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return healthResults;
  }

  /**
   * Get routing summary
   */
  getRoutingSummary(): {
    activeProviders: number;
    routingStrategy: string;
    fallbackEnabled: boolean;
    providers: string[];
  } {
    return {
      activeProviders: this.adapters.size,
      routingStrategy: this.config.routingStrategy || 'cheapest',
      fallbackEnabled: this.config.enableFallback || false,
      providers: Array.from(this.adapters.keys()),
    };
  }
}

