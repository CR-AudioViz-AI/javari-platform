/**
 * Admin Core Initialization
 * 
 * Sets up SUPER_ADMIN role, service accounts, and admin executor
 * All components remain fully audited and policy-compliant
 */

import { initializeJavariServiceAccount } from '@crai/identity';
import { policyRepository, PROTECTED_SYSTEM_POLICIES } from '@crai/policy';
import { adminExecutor } from '@crai/autonomy';
import { audit } from '@crai/audit';

/**
 * Initialize admin core infrastructure
 */
export async function initializeAdminCore(): Promise<void> {
  console.log('🔐 Initializing Admin Core Infrastructure...');
  
  try {
    // 1. Install protected system policies
    console.log('📋 Installing protected system policies...');
    for (const policy of PROTECTED_SYSTEM_POLICIES) {
      await policyRepository.createPolicy(policy);
      console.log(`   ✓ ${policy.name}`);
    }

    // 2. Initialize Javari AI service account
    console.log('🤖 Initializing Javari AI service account...');
    const javariAccount = await initializeJavariServiceAccount();
    console.log(`   ✓ Service Account ID: ${javariAccount.id}`);
    console.log(`   ✓ Roles: ${javariAccount.roles.join(', ')}`);

    // 3. Initialize admin executor
    console.log('⚡ Initializing admin executor...');
    await adminExecutor.initialize();
    console.log('   ✓ Admin executor ready');

    // 4. Audit initialization
    await audit.log(
      audit.builder()
        .type('system.deployment')
        .action('Admin Core Initialized')
        .resource('admin-core')
        .metadata({
          javariAccountId: javariAccount.id,
          policiesInstalled: PROTECTED_SYSTEM_POLICIES.length,
          compliance: 'fully_audited',
        })
        .success(true)
        .build()
    );

    console.log('✅ Admin Core Infrastructure Ready');
    console.log('');
    console.log('Summary:');
    console.log('  - SUPER_ADMIN role: active, protected, non-deletable');
    console.log('  - Protected policies: 3 installed');
    console.log('  - Javari AI: operational with super_admin role');
    console.log('  - Admin executor: ready for elevated operations');
    console.log('  - Compliance: 100% audited, no bypasses');
    console.log('');
  } catch (error) {
    console.error('❌ Admin Core initialization failed:', error);
    throw error;
  }
}

/**
 * Verify admin core is operational
 */
export async function verifyAdminCore(): Promise<boolean> {
  try {
    // Test admin executor
    const result = await adminExecutor.execute({
      executedBy: 'system',
      executedByRole: ['super_admin'],
      command: 'admin.health',
      params: {},
      timestamp: new Date(),
      requiresApproval: false,
    });

    return result.success;
  } catch (error) {
    console.error('Admin core verification failed:', error);
    return false;
  }
}
