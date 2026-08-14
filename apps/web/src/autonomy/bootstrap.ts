/**
 * Autonomy Engine Bootstrap
 * 
 * Initializes and starts the Autonomy Kernel
 */

import { autonomyKernel } from '@javari/autonomy';
import { initializeAdminCore, verifyAdminCore } from './initialize-admin';

/**
 * Bootstrap the Autonomy Engine
 */
export async function bootstrapAutonomy(): Promise<void> {
  console.log('🚀 Bootstrapping Autonomy Engine...');

  try {
    // Initialize admin core (SUPER_ADMIN, Javari, policies)
    await initializeAdminCore();

    // Initialize kernel
    await autonomyKernel.initialize();

    // Start autonomous execution
    await autonomyKernel.start();

    // Verify admin core
    const adminOk = await verifyAdminCore();
    if (!adminOk) {
      console.warn('⚠️ Admin core verification failed');
    }

    console.log('✅ Autonomy Engine ready');
    
    // Log status
    const status = autonomyKernel.getStatus();
    console.log('Status:', status);

  } catch (error) {
    console.error('❌ Autonomy Engine bootstrap failed:', error);
    throw error;
  }
}

/**
 * Shutdown the Autonomy Engine
 */
export async function shutdownAutonomy(): Promise<void> {
  console.log('🛑 Shutting down Autonomy Engine...');
  
  try {
    await autonomyKernel.stop();
    console.log('✅ Autonomy Engine stopped');
  } catch (error) {
    console.error('❌ Autonomy Engine shutdown error:', error);
  }
}

// Auto-bootstrap in production
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_AUTONOMY === 'true') {
  bootstrapAutonomy().catch(console.error);
}

// Handle process signals
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    shutdownAutonomy().catch(console.error);
  });

  process.on('SIGINT', () => {
    shutdownAutonomy().catch(console.error);
  });
}
