/**
 * Multi-AI Orchestrator - Provider Pricing
 * Phase E: Centralized pricing configuration
 */

export interface ProviderPricing {
  provider: string;
  model: string;
  costPer1MInput: number;
  costPer1MOutput: number;
  notes?: string;
}

// Current pricing as of January 2026
export const PROVIDER_PRICING: ProviderPricing[] = [
  // OpenAI
  { provider: 'openai', model: 'gpt-4o-mini', costPer1MInput: 0.150, costPer1MOutput: 0.600 },
  { provider: 'openai', model: 'gpt-4o', costPer1MInput: 2.500, costPer1MOutput: 10.000 },
  
  // Anthropic
  { provider: 'anthropic', model: 'claude-3-5-haiku-20241022', costPer1MInput: 0.800, costPer1MOutput: 4.000 },
  { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', costPer1MInput: 3.000, costPer1MOutput: 15.000 },
  
  // Google Gemini
  { provider: 'gemini', model: 'gemini-1.5-flash', costPer1MInput: 0.075, costPer1MOutput: 0.300 },
  { provider: 'gemini', model: 'gemini-1.5-pro', costPer1MInput: 1.250, costPer1MOutput: 5.000 },
  
  // Groq
  { provider: 'groq', model: 'llama-3.3-70b-versatile', costPer1MInput: 0.590, costPer1MOutput: 0.790 },
  { provider: 'groq', model: 'mixtral-8x7b-32768', costPer1MInput: 0.270, costPer1MOutput: 0.270 },
  
  // Perplexity
  { provider: 'perplexity', model: 'sonar', costPer1MInput: 1.000, costPer1MOutput: 1.000 },
  
  // Mistral
  { provider: 'mistral', model: 'mistral-large-latest', costPer1MInput: 2.000, costPer1MOutput: 6.000 },
  { provider: 'mistral', model: 'mistral-small-latest', costPer1MInput: 0.200, costPer1MOutput: 0.600 },
  
  // Together.ai
  { provider: 'together', model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', costPer1MInput: 0.880, costPer1MOutput: 0.880 },
  
  // Cohere
  { provider: 'cohere', model: 'command-r', costPer1MInput: 0.500, costPer1MOutput: 1.500 },
  { provider: 'cohere', model: 'command-r-plus', costPer1MInput: 3.000, costPer1MOutput: 15.000 },
  
  // OpenRouter
  { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet', costPer1MInput: 3.000, costPer1MOutput: 15.000 },
  
  // DeepInfra
  { provider: 'deepinfra', model: 'meta-llama/Meta-Llama-3.1-70B-Instruct', costPer1MInput: 0.350, costPer1MOutput: 0.400 },
];

// Fallback pricing for unknown models
export const FALLBACK_PRICING = {
  costPer1MInput: 1.000,
  costPer1MOutput: 3.000,
};

/**
 * Get pricing for a specific provider and model
 */
export function getProviderPricing(provider: string, model: string): ProviderPricing | null {
  return PROVIDER_PRICING.find(p => p.provider === provider && p.model === model) || null;
}

/**
 * Calculate cost for a request
 */
export function calculateCost(
  provider: string,
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  const pricing = getProviderPricing(provider, model);
  
  if (!pricing) {
    console.warn(`[Pricing] No pricing found for ${provider}/${model}, using fallback`);
    return (
      (tokensIn / 1_000_000) * FALLBACK_PRICING.costPer1MInput +
      (tokensOut / 1_000_000) * FALLBACK_PRICING.costPer1MOutput
    );
  }
  
  return (
    (tokensIn / 1_000_000) * pricing.costPer1MInput +
    (tokensOut / 1_000_000) * pricing.costPer1MOutput
  );
}

/**
 * Get all pricing records as a map for quick lookup
 */
export function getPricingMap(): Map<string, ProviderPricing> {
  const map = new Map<string, ProviderPricing>();
  for (const pricing of PROVIDER_PRICING) {
    const key = `${pricing.provider}:${pricing.model}`;
    map.set(key, pricing);
  }
  return map;
}
