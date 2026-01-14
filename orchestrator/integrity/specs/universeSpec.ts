import { z } from "zod";

/**
 * Universe Specification Schema
 * Phase Ω-V — Defines the complete standard for all universes
 */

export const UniverseSpecSchema = z.object({
  // Identity
  id: z.string().min(1).regex(/^[a-z_]+$/, "ID must be lowercase with underscores"),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(10),
  
  // Components
  workflows: z.array(z.string()).min(1),
  apis: z.array(z.string()).min(1),
  ui: z.array(z.string()).min(1),
  storage: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  
  // Performance Metrics
  metrics: z.object({
    load_factor: z.number().min(0).max(1),
    response_expectation_ms: z.number().min(1).max(10000),
    ai_cost_per_action: z.number().min(0),
    max_concurrent_users: z.number().min(1).default(100),
  }),
  
  // Dependencies & Integration
  dependencies: z.array(z.string()).default([]),
  integrations: z.array(z.string()).default([]),
  
  // Credits & Pricing
  credits: z.record(z.number()).default({}),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  status: z.enum(['active', 'beta', 'deprecated']).default('active'),
});

export type UniverseSpec = z.infer<typeof UniverseSpecSchema>;

/**
 * Workflow Specification Schema
 */
export const WorkflowSpecSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  universe: z.string().min(1),
  credits: z.number().min(0),
  steps: z.array(z.object({
    id: z.string(),
    provider: z.string(),
    model: z.string(),
    action: z.string(),
  })),
  maxExecutionTime: z.number().min(100).default(60000),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).default(3),
    backoffMs: z.number().min(0).default(1000),
  }).optional(),
});

export type WorkflowSpec = z.infer<typeof WorkflowSpecSchema>;

/**
 * API Specification Schema
 */
export const APISpecSchema = z.object({
  endpoint: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  universe: z.string().min(1),
  authentication: z.enum(['required', 'optional', 'none']).default('required'),
  rateLimit: z.object({
    requestsPerMinute: z.number().min(1),
    burstSize: z.number().min(1),
  }).optional(),
  validation: z.object({
    requestSchema: z.any().optional(),
    responseSchema: z.any().optional(),
  }).optional(),
});

export type APISpec = z.infer<typeof APISpecSchema>;
