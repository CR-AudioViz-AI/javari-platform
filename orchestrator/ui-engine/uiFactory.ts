/**
 * UI Factory - Universal UI Generator
 * Phase Ω-III: Auto-generates complete UI scaffolding from manifest
 */

import fs from 'fs';
import path from 'path';
import type { UniverseManifestType } from '../universes/registry/universeRegistry';
import {
  generateHubPage,
  generateDashboardPage,
  generateDetailPage,
  generateToolsPage,
  generateWorkflowsPage,
  generateCategoryBrowser,
  generateCommonComponents
} from './uiTemplates';
import { safeWriteFile } from './fileWriter';

export interface UIGenerationOptions {
  universeId: string;
  manifest: UniverseManifestType;
  outputDir?: string;
}

export interface UIGenerationResult {
  success: boolean;
  filesCreated: string[];
  errors: string[];
}

export async function generateUniverseUI(options: UIGenerationOptions): Promise<UIGenerationResult> {
  const { universeId, manifest, outputDir } = options;
  const baseDir = outputDir || `app/(communities)/communities/[id]/${universeId}`;
  
  const filesCreated: string[] = [];
  const errors: string[] = [];

  console.log(`\n🎨 Generating UI for ${manifest.name}...`);

  try {
    // 1. Hub Page (main entry point)
    console.log(`[1/7] Creating hub page...`);
    const hubPage = generateHubPage(manifest);
    const hubPath = `${baseDir}/page.tsx`;
    await safeWriteFile(hubPath, hubPage);
    filesCreated.push(hubPath);
    console.log(`   ✓ Created: ${hubPath}`);

    // 2. Dashboard Page
    console.log(`[2/7] Creating dashboard...`);
    const dashboardPage = generateDashboardPage(manifest);
    const dashboardPath = `${baseDir}/dashboard/page.tsx`;
    await safeWriteFile(dashboardPath, dashboardPage);
    filesCreated.push(dashboardPath);
    console.log(`   ✓ Created: ${dashboardPath}`);

    // 3. Detail Page Template
    console.log(`[3/7] Creating detail page template...`);
    const detailPage = generateDetailPage(manifest);
    const detailPath = `${baseDir}/[itemId]/page.tsx`;
    await safeWriteFile(detailPath, detailPage);
    filesCreated.push(detailPath);
    console.log(`   ✓ Created: ${detailPath}`);

    // 4. Tools Page
    console.log(`[4/7] Creating tools page...`);
    const toolsPage = generateToolsPage(manifest);
    const toolsPath = `${baseDir}/tools/page.tsx`;
    await safeWriteFile(toolsPath, toolsPage);
    filesCreated.push(toolsPath);
    console.log(`   ✓ Created: ${toolsPath}`);

    // 5. Workflows Page
    console.log(`[5/7] Creating workflows page...`);
    const workflowsPage = generateWorkflowsPage(manifest);
    const workflowsPath = `${baseDir}/workflows/page.tsx`;
    await safeWriteFile(workflowsPath, workflowsPage);
    filesCreated.push(workflowsPath);
    console.log(`   ✓ Created: ${workflowsPath}`);

    // 6. Category Browser (if features include categories)
    if (manifest.features?.includes('categories') || manifest.features?.includes('dynamic_categories')) {
      console.log(`[6/7] Creating category browser...`);
      const categoryPage = generateCategoryBrowser(manifest);
      const categoryPath = `${baseDir}/categories/page.tsx`;
      await safeWriteFile(categoryPath, categoryPage);
      filesCreated.push(categoryPath);
      console.log(`   ✓ Created: ${categoryPath}`);
    } else {
      console.log(`[6/7] Skipping category browser (not in features)`);
    }

    // 7. Common Components
    console.log(`[7/7] Creating common components...`);
    const components = generateCommonComponents(manifest);
    
    for (const [name, content] of Object.entries(components)) {
      const componentPath = `${baseDir}/components/${name}.tsx`;
      await safeWriteFile(componentPath, content);
      filesCreated.push(componentPath);
      console.log(`   ✓ Created: ${componentPath}`);
    }

    console.log(`\n✨ UI generation complete for ${manifest.name}`);
    console.log(`   Files created: ${filesCreated.length}`);

    return {
      success: true,
      filesCreated,
      errors
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(errorMsg);
    console.error(`\n❌ UI generation failed: ${errorMsg}`);
    
    return {
      success: false,
      filesCreated,
      errors
    };
  }
}
