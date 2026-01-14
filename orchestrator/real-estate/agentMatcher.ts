/**
 * Agent Matching Algorithm
 * Phase I: Match users with best-fit agents
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface AgentMatchCriteria {
  location: { city: string; state: string };
  specialization: 'buyer' | 'seller' | 'investor' | 'commercial';
  language?: string;
  minRating?: number;
}

export interface AgentMatch {
  id: string;
  userId: string;
  name: string;
  licenseNumber: string;
  specialization: string[];
  rating: number;
  totalSales: number;
  bio: string;
  matchScore: number;
}

export async function matchAgents(criteria: AgentMatchCriteria): Promise<AgentMatch[]> {
  if (!isSupabaseConfigured()) {
    console.log('[AgentMatcher] Dev mode - returning sample matches');
    return [];
  }

  try {
    const client = db['supabase'];
    if (!client) return [];

    let query = client
      .from('agents')
      .select('*')
      .eq('active', true)
      .eq('verified', true);

    // Filter by minimum rating
    if (criteria.minRating) {
      query = query.gte('rating', criteria.minRating);
    }

    // Filter by language if specified
    if (criteria.language) {
      query = query.contains('languages', [criteria.language]);
    }

    // Order by rating and sales
    query = query.order('rating', { ascending: false });
    query = query.order('total_sales', { ascending: false });
    query = query.limit(10);

    const { data, error } = await query;

    if (error) throw error;

    // Score matches based on criteria
    const matches = (data || []).map(agent => {
      let score = 50; // Base score

      // Boost for specialization match
      if (agent.specialization.includes(criteria.specialization)) {
        score += 30;
      }

      // Boost for high rating
      score += agent.rating * 10;

      // Boost for experience
      score += Math.min(agent.total_sales / 10, 10);

      return {
        id: agent.id,
        userId: agent.user_id,
        name: agent.name || 'Agent',
        licenseNumber: agent.license_number,
        specialization: agent.specialization,
        rating: parseFloat(agent.rating),
        totalSales: agent.total_sales,
        bio: agent.bio,
        matchScore: Math.min(score, 100),
      };
    });

    // Sort by match score and return top 3
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  } catch (error) {
    console.error('[AgentMatcher] Failed:', error);
    return [];
  }
}
