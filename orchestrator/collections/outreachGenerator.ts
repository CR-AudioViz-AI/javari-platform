/**
 * Outreach Generator (FDCPA-Compliant)
 * Phase II: Compliance-safe communication templates
 */

export interface OutreachRequest {
  accountId: string;
  debtorName: string;
  balance: number;
  originalCreditor: string;
  type: 'first_notice' | 'follow_up' | 'settlement' | 'dispute_ack';
}

export interface OutreachContent {
  subject: string;
  body: string;
  complianceChecks: string[];
  warnings: string[];
}

/**
 * Generate FDCPA-compliant outreach
 */
export async function generateOutreach(request: OutreachRequest): Promise<OutreachContent> {
  const { type, debtorName, balance, originalCreditor } = request;
  
  let subject = '';
  let body = '';
  const complianceChecks: string[] = [];
  const warnings: string[] = [];
  
  // Add universal compliance notices
  const miniMiranda = "This is an attempt to collect a debt. Any information obtained will be used for that purpose.";
  const disputeRights = "If you dispute this debt within 30 days, we will obtain verification and mail it to you.";
  
  switch (type) {
    case 'first_notice':
      subject = `Account Notice - ${originalCreditor}`;
      body = `Dear ${debtorName},

${miniMiranda}

We have been retained by ${originalCreditor} regarding an outstanding balance of $${balance.toFixed(2)}.

${disputeRights}

To discuss payment arrangements, please contact us at your earliest convenience.

Sincerely,
Collections Department`;
      complianceChecks.push('Mini-Miranda included', 'Dispute rights stated', 'No threats made');
      break;
      
    case 'follow_up':
      subject = `Follow-Up Notice - ${originalCreditor}`;
      body = `Dear ${debtorName},

${miniMiranda}

This is a follow-up regarding your account with ${originalCreditor}. The current balance is $${balance.toFixed(2)}.

We encourage you to contact us to discuss resolution options.

${disputeRights}

Sincerely,
Collections Department`;
      complianceChecks.push('Follow-up compliant', 'No harassment', 'Dispute rights included');
      break;
      
    case 'settlement':
      subject = `Settlement Offer - ${originalCreditor}`;
      body = `Dear ${debtorName},

${miniMiranda}

We are offering a settlement opportunity on your account with ${originalCreditor}.

Current Balance: $${balance.toFixed(2)}

Please contact us to discuss potential settlement arrangements.

${disputeRights}

Sincerely,
Collections Department`;
      complianceChecks.push('Settlement offer compliant', 'No coercion', 'Terms not legally binding without written agreement');
      warnings.push('Settlement requires written agreement');
      break;
      
    case 'dispute_ack':
      subject = `Dispute Acknowledgment - ${originalCreditor}`;
      body = `Dear ${debtorName},

We acknowledge receipt of your dispute regarding the account with ${originalCreditor}.

We are ceasing collection activity while we verify the debt as required by law. You will receive verification within 30 days.

Sincerely,
Collections Department`;
      complianceChecks.push('Dispute acknowledged', 'Collection activity ceased', 'Verification promised');
      break;
  }
  
  return {
    subject,
    body,
    complianceChecks,
    warnings,
  };
}

/**
 * Compliance filter - blocks unsafe content
 */
export function filterForCompliance(content: string): { safe: boolean; issues: string[] } {
  const issues: string[] = [];
  const forbidden = [
    'jail', 'prison', 'arrest', 'lawsuit', 'legal action', 'garnish',
    'credit report', 'credit score', 'ruin your credit',
    'shame', 'embarrass', 'contact your employer'
  ];
  
  const contentLower = content.toLowerCase();
  
  forbidden.forEach(term => {
    if (contentLower.includes(term)) {
      issues.push(`Contains forbidden term: "${term}"`);
    }
  });
  
  return {
    safe: issues.length === 0,
    issues,
  };
}
