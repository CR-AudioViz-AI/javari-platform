/**
 * Multi-AI Orchestrator - Environment Validation
 * Phase D: Production deployment checks
 */

import { isSupabaseConfigured, getConnectionError } from '../db/client';
import { getActiveProviders } from '../providers';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: Record<string, any>;
}

export function validateDeploymentEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: Record<string, any> = {};

  // Check critical ENV vars
  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV not set');
  } else {
    info.nodeEnv = process.env.NODE_ENV;
  }

  // Check Supabase
  const supabaseConfigured = isSupabaseConfigured();
  info.supabaseConfigured = supabaseConfigured;
  
  if (!supabaseConfigured) {
    const error = getConnectionError();
    warnings.push(`Supabase not configured: ${error}`);
  }

  // Check providers
  const activeProviders = getActiveProviders();
  info.activeProviders = activeProviders.map(p => p.name);
  info.providerCount = activeProviders.length;

  if (activeProviders.length === 0) {
    errors.push('No AI providers configured - at least one is required');
  } else if (activeProviders.length < 2) {
    warnings.push('Only one provider configured - fallback capability limited');
  }

  // Check orchestrator settings
  const autoApproveThreshold = process.env.ORCHESTRATOR_AUTO_APPROVE_THRESHOLD_USD;
  if (autoApproveThreshold) {
    info.autoApproveThresholdUSD = parseFloat(autoApproveThreshold);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}
