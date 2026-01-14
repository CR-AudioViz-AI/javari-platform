/**
 * Segmentation Engine
 * Phase II: Account scoring and prioritization
 */

export interface Account {
  id: string;
  balance: number;
  age: number;
  state: string;
  lastContact?: Date;
  responsiveness: number;
}

export interface ScoredAccount extends Account {
  score: number;
  segment: string;
  factors: {
    balanceScore: number;
    ageScore: number;
    responsivenessScore: number;
    riskScore: number;
  };
}

export interface Segment {
  label: string;
  accounts: ScoredAccount[];
  totalBalance: number;
  averageScore: number;
}

/**
 * Score individual account (0-100)
 */
export function scoreAccount(account: Account): ScoredAccount {
  // Balance scoring (0-30 points)
  const balanceScore = Math.min((account.balance / 10000) * 30, 30);
  
  // Age scoring (0-25 points) - newer is higher priority
  const ageScore = Math.max(25 - (account.age / 30), 0);
  
  // Responsiveness scoring (0-25 points)
  const responsivenessScore = account.responsiveness * 25;
  
  // Risk scoring (0-20 points) - state-based
  const highRiskStates = ['CA', 'NY', 'TX'];
  const riskScore = highRiskStates.includes(account.state) ? 20 : 10;
  
  const totalScore = balanceScore + ageScore + responsivenessScore + riskScore;
  
  // Determine segment
  let segment = 'low';
  if (totalScore >= 75) segment = 'critical';
  else if (totalScore >= 50) segment = 'high';
  else if (totalScore >= 25) segment = 'medium';
  
  return {
    ...account,
    score: totalScore,
    segment,
    factors: {
      balanceScore,
      ageScore,
      responsivenessScore,
      riskScore,
    },
  };
}

/**
 * Segment accounts into priority groups
 */
export function segmentAccounts(accounts: Account[]): Segment[] {
  const scored = accounts.map(scoreAccount);
  
  const segments: Record<string, ScoredAccount[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };
  
  scored.forEach(account => {
    segments[account.segment].push(account);
  });
  
  return Object.entries(segments).map(([label, accts]) => ({
    label,
    accounts: accts.sort((a, b) => b.score - a.score),
    totalBalance: accts.reduce((sum, a) => sum + a.balance, 0),
    averageScore: accts.length > 0 ? accts.reduce((sum, a) => sum + a.score, 0) / accts.length : 0,
  }));
}

/**
 * Build priority queue (top N accounts)
 */
export function buildPriorityQueue(accounts: Account[], limit: number = 50): ScoredAccount[] {
  return accounts
    .map(scoreAccount)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate segment distribution
 */
export function generateSegments(accounts: Account[]): {
  segments: Segment[];
  totalAccounts: number;
  totalBalance: number;
  distribution: Record<string, number>;
} {
  const segments = segmentAccounts(accounts);
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  
  const distribution: Record<string, number> = {};
  segments.forEach(seg => {
    distribution[seg.label] = (seg.accounts.length / totalAccounts) * 100;
  });
  
  return {
    segments,
    totalAccounts,
    totalBalance,
    distribution,
  };
}
