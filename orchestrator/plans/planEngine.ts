/**
 * Plan Engine
 * Phase H: Subscription plan management
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface Plan {
  id: string;
  name: string;
  monthlyCredits: number;
  rolloverEnabled: boolean;
  maxRollover?: number;
  priceUSD: number;
  features: Record<string, any>;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyCredits: 100,
    rolloverEnabled: false,
    priceUSD: 0,
    features: { max_workflows: 10, max_communities: 1, support: 'community' },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyCredits: 1000,
    rolloverEnabled: true,
    maxRollover: 500,
    priceUSD: 29.99,
    features: { max_workflows: -1, max_communities: 10, support: 'email' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyCredits: 10000,
    rolloverEnabled: true,
    maxRollover: 5000,
    priceUSD: 299.99,
    features: { max_workflows: -1, max_communities: -1, support: 'priority', sla: true },
  },
];

export async function getPlan(planId: string): Promise<Plan | null> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_PLANS.find(p => p.id === planId) || null;
  }

  try {
    const client = db['supabase'];
    if (!client) return null;

    const { data, error } = await client
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) return null;

    return {
      id: data.id,
      name: data.name,
      monthlyCredits: parseFloat(data.monthly_credits),
      rolloverEnabled: data.rollover_enabled,
      maxRollover: data.max_rollover ? parseFloat(data.max_rollover) : undefined,
      priceUSD: parseFloat(data.price_usd),
      features: data.features,
    };
  } catch (error) {
    return null;
  }
}

export async function getAllPlans(): Promise<Plan[]> {
  if (!isSupabaseConfigured()) return DEFAULT_PLANS;

  try {
    const client = db['supabase'];
    if (!client) return DEFAULT_PLANS;

    const { data, error } = await client
      .from('plans')
      .select('*')
      .eq('active', true);

    if (error) return DEFAULT_PLANS;

    return data.map(p => ({
      id: p.id,
      name: p.name,
      monthlyCredits: parseFloat(p.monthly_credits),
      rolloverEnabled: p.rollover_enabled,
      maxRollover: p.max_rollover ? parseFloat(p.max_rollover) : undefined,
      priceUSD: parseFloat(p.price_usd),
      features: p.features,
    }));
  } catch (error) {
    return DEFAULT_PLANS;
  }
}
