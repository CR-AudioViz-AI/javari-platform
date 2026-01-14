/**
 * Collections Dashboards
 * Phase II: Performance metrics and analytics
 */

export interface CollectorDashboard {
  assignedAccounts: number;
  totalBalance: number;
  callsMade: number;
  ptpCommitments: number;
  paymentsReceived: number;
  recoveryRate: number;
}

export interface SupervisorDashboard {
  teamSize: number;
  totalAccounts: number;
  totalBalance: number;
  recoveryRate: number;
  agingBuckets: {
    current: number;
    '30_60': number;
    '60_90': number;
    '90_plus': number;
  };
  topCollectors: Array<{
    name: string;
    recoveryRate: number;
    accounts: number;
  }>;
}

export interface ClientDashboard {
  placementDate: Date;
  totalAccounts: number;
  totalBalance: number;
  recovered: number;
  recoveryRate: number;
  accountsByStatus: Record<string, number>;
}

export function generateCollectorMetrics(data: any): CollectorDashboard {
  return {
    assignedAccounts: data.accounts?.length || 0,
    totalBalance: data.accounts?.reduce((sum: number, a: any) => sum + a.balance, 0) || 0,
    callsMade: data.calls || 0,
    ptpCommitments: data.ptps || 0,
    paymentsReceived: data.payments || 0,
    recoveryRate: data.recovered / data.totalBalance || 0,
  };
}

export function generateSupervisorMetrics(data: any): SupervisorDashboard {
  return {
    teamSize: data.collectors?.length || 0,
    totalAccounts: data.totalAccounts || 0,
    totalBalance: data.totalBalance || 0,
    recoveryRate: (data.recovered / data.totalBalance) * 100 || 0,
    agingBuckets: {
      current: data.agingBuckets?.current || 0,
      '30_60': data.agingBuckets?.['30_60'] || 0,
      '60_90': data.agingBuckets?.['60_90'] || 0,
      '90_plus': data.agingBuckets?.['90_plus'] || 0,
    },
    topCollectors: data.topCollectors || [],
  };
}
