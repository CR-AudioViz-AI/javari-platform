/**
 * Presentation Maker Asset Vault Mapping
 */

export interface PresentationAssets {
  inputs: {
    topic: string;
    audience: string;
    slideCount: number;
    brandImages?: string[]; // paths in asset vault
    template?: string; // template ID from vault
  };
  outputs: {
    pptx: string; // /exports/presentations/{id}.pptx
    pdf: string; // /exports/presentations/{id}.pdf
    json: string; // /generated-content/presentations/{id}.json
  };
  templates: {
    professional: string;
    creative: string;
    minimal: string;
  };
}

export const PRESENTATION_ASSET_PATHS = {
  TEMPLATES: 'templates/presentations/',
  UPLOADS: 'uploads/presentations/',
  EXPORTS: 'exports/presentations/',
  GENERATED: 'generated-content/presentations/',
  IMAGES: 'images/presentations/',
} as const;
