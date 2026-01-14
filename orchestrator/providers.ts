/**
 * Multi-AI Orchestrator - Provider Registry
 * Phase B: Central registry for all LLM providers
 * 
 * Imports all adapters and exposes metadata about each provider
 */

import { OpenAIAdapter } from './adapters/openai';
import { AnthropicAdapter } from './adapters/anthropic';
import { GeminiAdapter } from './adapters/gemini';
import { GroqAdapter } from './adapters/groq';
import { PerplexityAdapter } from './adapters/perplexity';
import { MistralAdapter } from './adapters/mistral';
import { TogetherAdapter } from './adapters/together';
import { CohereAdapter } from './adapters/cohere';
import { OpenRouterAdapter } from './adapters/openrouter';
import { DeepInfraAdapter } from './adapters/deepinfra';
import { isProviderConfigured } from './env/validate-env';
import type { LLMAdapter } from './types/llm-adapter';

export interface ProviderMetadata {
  name: string;
  displayName: string;
  adapter: typeof OpenAIAdapter | typeof AnthropicAdapter | typeof GeminiAdapter | typeof GroqAdapter | typeof PerplexityAdapter | typeof MistralAdapter | typeof TogetherAdapter | typeof CohereAdapter | typeof OpenRouterAdapter | typeof DeepInfraAdapter;
  defaultModel: string;
  capabilities: string[];
  isConfigured: boolean;
  estimatedCostPerMToken: { input: number; output: number }; // USD per 1M tokens
  typicalLatencyMs: number;
  maxContextLength: number;
}

const PROVIDER_METADATA: Record<string, Omit<ProviderMetadata, 'isConfigured'>> = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    adapter: OpenAIAdapter,
    defaultModel: 'gpt-4o-mini',
    capabilities: ['text-generation', 'function-calling', 'streaming', 'json-mode', 'vision'],
    estimatedCostPerMToken: { input: 0.15, output: 0.6 },
    typicalLatencyMs: 1500,
    maxContextLength: 128000,
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic (Claude)',
    adapter: AnthropicAdapter,
    defaultModel: 'claude-3-5-haiku-20241022',
    capabilities: ['text-generation', 'streaming', 'vision', 'long-context'],
    estimatedCostPerMToken: { input: 0.8, output: 4 },
    typicalLatencyMs: 2000,
    maxContextLength: 200000,
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    adapter: GeminiAdapter,
    defaultModel: 'gemini-1.5-flash',
    capabilities: ['text-generation', 'streaming', 'vision', 'long-context'],
    estimatedCostPerMToken: { input: 0.075, output: 0.3 },
    typicalLatencyMs: 1800,
    maxContextLength: 1000000,
  },
  groq: {
    name: 'groq',
    displayName: 'Groq',
    adapter: GroqAdapter,
    defaultModel: 'llama-3.3-70b-versatile',
    capabilities: ['text-generation', 'streaming', 'fast-inference'],
    estimatedCostPerMToken: { input: 0.59, output: 0.79 },
    typicalLatencyMs: 400,
    maxContextLength: 32768,
  },
  perplexity: {
    name: 'perplexity',
    displayName: 'Perplexity',
    adapter: PerplexityAdapter,
    defaultModel: 'sonar',
    capabilities: ['text-generation', 'online-search', 'citations'],
    estimatedCostPerMToken: { input: 1, output: 1 },
    typicalLatencyMs: 2500,
    maxContextLength: 127072,
  },
  mistral: {
    name: 'mistral',
    displayName: 'Mistral',
    adapter: MistralAdapter,
    defaultModel: 'mistral-large-latest',
    capabilities: ['text-generation', 'streaming', 'function-calling'],
    estimatedCostPerMToken: { input: 2, output: 6 },
    typicalLatencyMs: 1600,
    maxContextLength: 128000,
  },
  together: {
    name: 'together',
    displayName: 'Together.ai',
    adapter: TogetherAdapter,
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    capabilities: ['text-generation', 'streaming'],
    estimatedCostPerMToken: { input: 0.88, output: 0.88 },
    typicalLatencyMs: 1200,
    maxContextLength: 32768,
  },
  cohere: {
    name: 'cohere',
    displayName: 'Cohere',
    adapter: CohereAdapter,
    defaultModel: 'command-r',
    capabilities: ['text-generation', 'streaming', 'embeddings'],
    estimatedCostPerMToken: { input: 0.5, output: 1.5 },
    typicalLatencyMs: 1400,
    maxContextLength: 128000,
  },
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    adapter: OpenRouterAdapter,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    capabilities: ['text-generation', 'streaming', 'multi-model'],
    estimatedCostPerMToken: { input: 3, output: 15 },
    typicalLatencyMs: 2000,
    maxContextLength: 200000,
  },
  deepinfra: {
    name: 'deepinfra',
    displayName: 'DeepInfra',
    adapter: DeepInfraAdapter,
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    capabilities: ['text-generation', 'streaming'],
    estimatedCostPerMToken: { input: 0.35, output: 0.4 },
    typicalLatencyMs: 1100,
    maxContextLength: 131072,
  },
};

/**
 * Get metadata for all providers with configuration status
 */
export function getAllProviders(): ProviderMetadata[] {
  return Object.values(PROVIDER_METADATA).map(metadata => ({
    ...metadata,
    isConfigured: isProviderConfigured(metadata.name),
  }));
}

/**
 * Get metadata for configured providers only
 */
export function getActiveProviders(): ProviderMetadata[] {
  return getAllProviders().filter(p => p.isConfigured);
}

/**
 * Get metadata for a specific provider
 */
export function getProviderMetadata(providerName: string): ProviderMetadata | undefined {
  const metadata = PROVIDER_METADATA[providerName];
  if (!metadata) return undefined;

  return {
    ...metadata,
    isConfigured: isProviderConfigured(providerName),
  };
}

/**
 * Create an adapter instance for a provider
 */
export function createAdapter(providerName: string, model?: string): LLMAdapter | null {
  const metadata = PROVIDER_METADATA[providerName];
  if (!metadata) {
    console.error(`[Registry] Unknown provider: ${providerName}`);
    return null;
  }

  if (!isProviderConfigured(providerName)) {
    console.warn(`[Registry] Provider ${providerName} not configured`);
    return null;
  }

  try {
    return new metadata.adapter(model || metadata.defaultModel);
  } catch (error) {
    console.error(`[Registry] Failed to create adapter for ${providerName}:`, error);
    return null;
  }
}

/**
 * Get the cheapest configured provider
 */
export function getCheapestProvider(): ProviderMetadata | null {
  const active = getActiveProviders();
  if (active.length === 0) return null;

  return active.reduce((cheapest, current) => {
    const cheapestCost = cheapest.estimatedCostPerMToken.input + cheapest.estimatedCostPerMToken.output;
    const currentCost = current.estimatedCostPerMToken.input + current.estimatedCostPerMToken.output;
    return currentCost < cheapestCost ? current : cheapest;
  });
}

/**
 * Get the fastest configured provider
 */
export function getFastestProvider(): ProviderMetadata | null {
  const active = getActiveProviders();
  if (active.length === 0) return null;

  return active.reduce((fastest, current) =>
    current.typicalLatencyMs < fastest.typicalLatencyMs ? current : fastest
  );
}

/**
 * Find providers that support a specific capability
 */
export function getProvidersWithCapability(capability: string): ProviderMetadata[] {
  return getActiveProviders().filter(p => p.capabilities.includes(capability));
}
