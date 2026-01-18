/**
 * Autonomy Engine™ — Admin Executor
 * 
 * Elevated execution layer for super_admin operations
 * All executions fully audited and policy-compliant
 * 
 * @package @crai/autonomy
 * @module AutonomyEngine/AdminExecutor
 */

import { audit } from '@crai/audit';
import { policyEngine } from '@crai/policy';
import type { AdminExecutionContext, AdminExecutionResult } from '@crai/identity';
import { CommandRouter } from './command-router';

export class AdminExecutor {
  private commandRouter: CommandRouter;

  constructor() {
    this.commandRouter = new CommandRouter();
  }

  async initialize(): Promise<void> {
    await this.commandRouter.initialize();
    this.registerAdminCommands();
  }

  /**
   * Execute admin command with full audit trail
   * 
   * This is NOT a bypass - it goes through:
   * 1. Policy evaluation (super_admin gets explicit ALLOW)
   * 2. Audit logging (full trail of all actions)
   * 3. Command routing (normal execution path)
   * 4. Error handling (same as any command)
   */
  async execute<T = unknown>(
    context: AdminExecutionContext
  ): Promise<AdminExecutionResult<T>> {
    const startTime = Date.now();

    // 1. Verify super_admin role
    if (!context.executedByRole.includes('super_admin')) {
      throw new Error('Admin execution requires super_admin role');
    }

    // 2. Evaluate policy (explicit ALLOW for super_admin)
    const policyDecision = await policyEngine.evaluate(
      context.executedBy,
      'admin:execute',
      'execute',
      {
        userRoles: context.executedByRole,
        command: context.command,
        timestamp: context.timestamp,
      }
    );

    if (policyDecision.decision !== 'allow') {
      throw new Error(`Policy denied admin execution: ${policyDecision.reason}`);
    }

    // 3. Create audit entry BEFORE execution
    const auditEntryBefore = await audit.log(
      audit.builder()
        .type('system.deployment')
        .user(context.executedBy)
        .action(`Admin Execute: ${context.command}`)
        .resource('admin:execute')
        .metadata({
          command: context.command,
          params: context.params,
          roles: context.executedByRole,
          policyDecision: policyDecision.decision,
        })
        .success(true)
        .build()
    );

    try {
      // 4. Execute command through normal routing
      const result = await this.commandRouter.route<T>(
        context.command,
        context.params,
        {
          id: context.auditId || `admin_${Date.now()}`,
          task: context.command,
          params: context.params,
          timestamp: context.timestamp,
        }
      );

      const executionTime = Date.now() - startTime;

      // 5. Audit successful execution
      await audit.log(
        audit.builder()
          .type('system.deployment')
          .user(context.executedBy)
          .action(`Admin Execute Complete: ${context.command}`)
          .resource('admin:execute')
          .metadata({
            command: context.command,
            success: true,
            executionTime,
          })
          .duration(executionTime)
          .success(true)
          .build()
      );

      return {
        success: true,
        data: result,
        executionTime,
        auditId: context.auditId || '',
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // 6. Audit failed execution
      await audit.log(
        audit.builder()
          .type('system.deployment')
          .user(context.executedBy)
          .action(`Admin Execute Failed: ${context.command}`)
          .resource('admin:execute')
          .error(error instanceof Error ? error.message : 'Unknown error')
          .duration(executionTime)
          .build()
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        auditId: context.auditId || '',
      };
    }
  }

  /**
   * Register admin-specific commands
   */
  private registerAdminCommands(): void {
    // Admin health check
    this.commandRouter.registerRoute('admin.health', async () => {
      return {
        status: 'healthy',
        adminExecutor: 'operational',
        timestamp: new Date().toISOString(),
      };
    });

    // Admin system info
    this.commandRouter.registerRoute('admin.systemInfo', async () => {
      return {
        platform: 'CRAI Platform',
        version: '1.0.0',
        autonomyEngine: 'active',
        timestamp: new Date().toISOString(),
      };
    });

    // Admin execute wrapper (for multi-path failover)
    this.commandRouter.registerRoute('admin.execute', async (params) => {
      const { command, commandParams, executedBy, roles } = params;

      return await this.execute({
        executedBy: executedBy as string,
        executedByRole: roles as string[],
        command: command as string,
        params: commandParams as Record<string, unknown>,
        timestamp: new Date(),
        requiresApproval: false,
      });
    });
  }
}

// Export singleton instance
export const adminExecutor = new AdminExecutor();
