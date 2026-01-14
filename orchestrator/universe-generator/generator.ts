/**
 * Universe Scaffold Builder
 * Phase Ω-II — Generates a full universe from a single ID
 */

import fs from 'fs';
import path from 'path';
import {
  createManifestTemplate,
  createDefaultWorkflows,
  createAPIStubs,
  createUIPages,
  createWorkflowFile,
  createUIEntrypoint,
  createAPIRoute
} from './templates';

export async function buildUniverse(id: string) {
  console.log(`\n[1/6] Creating manifest...`);
  const manifestsPath = "orchestrator/universes/manifests";
  
  // 1. Manifest
  const manifest = createManifestTemplate(id);
  const workflows = createDefaultWorkflows(id);
  manifest.workflows = workflows.map(w => w.name);
  manifest.api = createAPIStubs(id);
  manifest.ui = createUIPages(id);

  fs.writeFileSync(
    `${manifestsPath}/${id}.json`,
    JSON.stringify(manifest, null, 2)
  );
  console.log(`   ✓ Created: ${manifestsPath}/${id}.json`);

  // 2. Workflows
  console.log(`\n[2/6] Creating workflows...`);
  const workflowDir = `orchestrator/workflows/${id}`;
  fs.mkdirSync(workflowDir, { recursive: true });

  workflows.forEach(wf => {
    const content = createWorkflowFile(id, wf.name, wf.description);
    fs.writeFileSync(
      `${workflowDir}/${wf.name}.workflow.ts`,
      content
    );
    console.log(`   ✓ Created: ${workflowDir}/${wf.name}.workflow.ts`);
  });

  // 3. API Routes
  console.log(`\n[3/6] Creating API routes...`);
  const apiDir = `app/api/${id}`;
  
  createAPIStubs(id).forEach(endpoint => {
    const endpointDir = `${apiDir}/${endpoint}`;
    fs.mkdirSync(endpointDir, { recursive: true });
    
    const content = createAPIRoute(id, endpoint);
    fs.writeFileSync(`${endpointDir}/route.ts`, content);
    console.log(`   ✓ Created: ${endpointDir}/route.ts`);
  });

  // 4. UI Entry Point
  console.log(`\n[4/6] Creating UI pages...`);
  const uiPath = `app/(communities)/communities/[id]/${id}`;
  fs.mkdirSync(uiPath, { recursive: true });
  
  const uiContent = createUIEntrypoint(id);
  fs.writeFileSync(`${uiPath}/page.tsx`, uiContent);
  console.log(`   ✓ Created: ${uiPath}/page.tsx`);

  // 5. Asset Directories
  console.log(`\n[5/6] Creating asset directories...`);
  const assetPath = `/mnt/user-data/universes/${id}`;
  const assetDirs = ['images', 'documents', 'data'];
  
  assetDirs.forEach(dir => {
    const fullPath = `${assetPath}/${dir}`;
    console.log(`   ✓ Asset path defined: ${fullPath}`);
  });

  // 6. Feature Flag
  console.log(`\n[6/6] Feature flag info...`);
  const flagName = `NEXT_PUBLIC_${id.toUpperCase()}_ENABLED`;
  console.log(`   ℹ Add to .env: ${flagName}=true`);

  return manifest;
}
