/**
 * Monthly Credit Refill Task
 * Phase H: Cron job for monthly credit allocation
 * 
 * This is a stub for Vercel Cron or similar scheduler
 */

import { db, isSupabaseConfigured } from '../db/client';
import { creditEngine } from './creditEngine';
import { getAllPlans } from '../plans/planEngine';

export async function monthlyRefillTask(): Promise<{
  usersProcessed: number;
  creditsAdded: number;
}> {
  console.log('[Refill] Starting monthly credit refill...');

  if (!isSupabaseConfigured()) {
    console.log('[Refill] Skipped (database not configured)');
    return { usersProcessed: 0, creditsAdded: 0 };
  }

  let usersProcessed = 0;
  let creditsAdded = 0;

  try {
    const client = db['supabase'];
    if (!client) return { usersProcessed: 0, creditsAdded: 0 };

    // Get all active credit balances
    const { data: balances, error } = await client
      .from('credit_balances')
      .select('user_id, community_id, plan_id, credits_available');

    if (error) throw error;

    // Get all plans
    const plans = await getAllPlans();
    const planMap = new Map(plans.map(p => [p.id, p]));

    // Process each user
    for (const balance of balances) {
      const plan = planMap.get(balance.plan_id);
      if (!plan) continue;

      let refillAmount = plan.monthlyCredits;

      // Handle rollover
      if (plan.rolloverEnabled && plan.maxRollover) {
        const currentBalance = parseFloat(balance.credits_available);
        if (currentBalance > 0) {
          const rollover = Math.min(currentBalance, plan.maxRollover);
          refillAmount += rollover;
        }
      }

      // Add credits
      await creditEngine.addCredits(
        balance.user_id,
        balance.community_id,
        refillAmount,
        'monthly_refill'
      );

      usersProcessed++;
      creditsAdded += refillAmount;
    }

    console.log(`[Refill] Completed: ${usersProcessed} users, ${creditsAdded} credits`);
  } catch (error) {
    console.error('[Refill] Failed:', error);
  }

  return { usersProcessed, creditsAdded };
}
