/**
 * Phase Ω: Workflow Factory
 * Generates workflows from universe manifest definitions
 */

import { identificationWorkflow } from "@/orchestrator/workflows/collectibles/identification.workflow";

const WORKFLOW_LIBRARY: Record<string, any> = {
  identify_item: identificationWorkflow,
};

export function getWorkflow(name: string) {
  return WORKFLOW_LIBRARY[name] || null;
}

export function loadUniverseWorkflows(manifest: any) {
  return manifest.workflows.map((wf: string) => getWorkflow(wf));
}
