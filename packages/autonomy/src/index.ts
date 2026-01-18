/**
 * @crai/autonomy — Autonomy Engine™
 * 
 * Core autonomous execution engine for CRAI Platform
 * 
 * @package @crai/autonomy
 */

export const OS_NAME = 'AutonomyEngine';
export const OS_VERSION = '1.0.0';
export const OS_DOMAIN = 'autonomy';

// Export kernel
export * from './kernel';
export * from './scheduler';
export * from './failover';
export * from './recovery';
export * from './execution-context';
export * from './command-router';
export * from './memory';
export * from './self-repair';
export * from './multi-ai';
export * from './admin-executor';

// Export singleton instance
export { autonomyKernel } from './kernel';
export { adminExecutor } from './admin-executor';
