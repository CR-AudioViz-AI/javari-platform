/**
 * Multi-AI Orchestrator - Environment Validation
 * Phase B: Validates API keys and marks providers as available/unavailable
 * 
 * SECURITY: Never logs actual key values
 */

export interface ProviderEnvConfig {
  name: string;
  envVar: string;
  required: boolean;
  isConfigured: boolean;
}

export interface EnvValidationResult {
  allConfigured: boolean;
  configuredProviders: string[];
  missingProviders: string[];
  providerStatus: Record<string, ProviderEnvConfig>;
}

const PROVIDER_ENV_VARS: ProviderEnvConfig[] = [
  { name: 'openai', envVar: 'OPENAI_API_KEY', required: false, isConfigured: false },
  { name: 'anthropic', envVar: 'ANTHROPIC_API_KEY', required: false, isConfigured: false },
  { name: 'gemini', envVar: 'GEMINI_API_KEY', required: false, isConfigured: false },
  { name: 'groq', envVar: 'GROQ_API_KEY', required: false, isConfigured: false },
  { name: 'perplexity', envVar: 'PERPLEXITY_API_KEY', required: false, isConfigured: false },
  { name: 'mistral', envVar: 'MISTRAL_API_KEY', required: false, isConfigured: false },
  { name: 'together', envVar: 'TOGETHER_API_KEY', required: false, isConfigured: false },
  { name: 'cohere', envVar: 'COHERE_API_KEY', required: false, isConfigured: false },
  { name: 'openrouter', envVar: 'OPENROUTER_API_KEY', required: false, isConfigured: false },
  { name: 'deepinfra', envVar: 'DEEPINFRA_API_KEY', required: false, isConfigured: false },
];

/**
 * Validate environment variables for all providers
 * Returns status without logging actual key values
 */
export function validateEnvironment(): EnvValidationResult {
  const providerStatus: Record<string, ProviderEnvConfig> = {};
  const configuredProviders: string[] = [];
  const missingProviders: string[] = [];

  for (const config of PROVIDER_ENV_VARS) {
    const value = process.env[config.envVar];
    const isConfigured = Boolean(value && value.length > 0);

    providerStatus[config.name] = {
      ...config,
      isConfigured,
    };

    if (isConfigured) {
      configuredProviders.push(config.name);
    } else {
      missingProviders.push(config.name);
      if (config.required) {
        console.warn(`[ENV] Required provider ${config.name} missing: ${config.envVar} not configured`);
      }
    }
  }

  const allConfigured = configuredProviders.length === PROVIDER_ENV_VARS.length;

  // Log summary (never log actual keys)
  console.log(`[ENV] Provider status: ${configuredProviders.length}/${PROVIDER_ENV_VARS.length} configured`);
  console.log(`[ENV] Active providers:`, configuredProviders.join(', ') || 'none');
  if (missingProviders.length > 0) {
    console.log(`[ENV] Inactive providers:`, missingProviders.join(', '));
  }

  return {
    allConfigured,
    configuredProviders,
    missingProviders,
    providerStatus,
  };
}

/**
 * Check if a specific provider is configured
 */
export function isProviderConfigured(providerName: string): boolean {
  const config = PROVIDER_ENV_VARS.find(p => p.name === providerName);
  if (!config) return false;

  const value = process.env[config.envVar];
  return Boolean(value && value.length > 0);
}

/**
 * Get list of all configured providers
 */
export function getConfiguredProviders(): string[] {
  return PROVIDER_ENV_VARS
    .filter(config => {
      const value = process.env[config.envVar];
      return Boolean(value && value.length > 0);
    })
    .map(config => config.name);
}

/**
 * Get environment variable name for a provider
 */
export function getProviderEnvVar(providerName: string): string | undefined {
  const config = PROVIDER_ENV_VARS.find(p => p.name === providerName);
  return config?.envVar;
}
