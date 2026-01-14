/**
 * Content Tools Feature Flags
 * Phase F: Unified flag management for all 6 content tools
 */

export interface ToolFlags {
  master: boolean;
  aiEnabled: boolean;
  exportEnabled: boolean;
  templatesEnabled: boolean;
}

export const CONTENT_TOOL_FLAGS = {
  // Presentation Maker
  PRESENTATION_ENABLED: process.env.NEXT_PUBLIC_CONTENT_PRESENTATION_ENABLED === 'true',
  PRESENTATION_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_PRESENTATION_AI_ENABLED === 'true',
  PRESENTATION_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_PRESENTATION_EXPORT_ENABLED === 'true',
  PRESENTATION_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_PRESENTATION_TEMPLATES_ENABLED === 'true',

  // Resume Builder
  RESUME_ENABLED: process.env.NEXT_PUBLIC_CONTENT_RESUME_ENABLED === 'true',
  RESUME_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_RESUME_AI_ENABLED === 'true',
  RESUME_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_RESUME_EXPORT_ENABLED === 'true',
  RESUME_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_RESUME_TEMPLATES_ENABLED === 'true',

  // Ebook Creator
  EBOOK_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EBOOK_ENABLED === 'true',
  EBOOK_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EBOOK_AI_ENABLED === 'true',
  EBOOK_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EBOOK_EXPORT_ENABLED === 'true',
  EBOOK_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EBOOK_TEMPLATES_ENABLED === 'true',

  // Social Posts
  SOCIAL_ENABLED: process.env.NEXT_PUBLIC_CONTENT_SOCIAL_ENABLED === 'true',
  SOCIAL_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_SOCIAL_AI_ENABLED === 'true',
  SOCIAL_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_SOCIAL_EXPORT_ENABLED === 'true',
  SOCIAL_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_SOCIAL_TEMPLATES_ENABLED === 'true',

  // Email Templates
  EMAIL_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EMAIL_ENABLED === 'true',
  EMAIL_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EMAIL_AI_ENABLED === 'true',
  EMAIL_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EMAIL_EXPORT_ENABLED === 'true',
  EMAIL_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_EMAIL_TEMPLATES_ENABLED === 'true',

  // Cover Letter Pro
  COVER_LETTER_ENABLED: process.env.NEXT_PUBLIC_CONTENT_COVER_LETTER_ENABLED === 'true',
  COVER_LETTER_AI_ENABLED: process.env.NEXT_PUBLIC_CONTENT_COVER_LETTER_AI_ENABLED === 'true',
  COVER_LETTER_EXPORT_ENABLED: process.env.NEXT_PUBLIC_CONTENT_COVER_LETTER_EXPORT_ENABLED === 'true',
  COVER_LETTER_TEMPLATES_ENABLED: process.env.NEXT_PUBLIC_CONTENT_COVER_LETTER_TEMPLATES_ENABLED === 'true',
} as const;

export function getToolFlags(tool: string): ToolFlags {
  const toolUpper = tool.toUpperCase().replace(/-/g, '_');
  return {
    master: CONTENT_TOOL_FLAGS[`${toolUpper}_ENABLED`] || false,
    aiEnabled: CONTENT_TOOL_FLAGS[`${toolUpper}_AI_ENABLED`] || false,
    exportEnabled: CONTENT_TOOL_FLAGS[`${toolUpper}_EXPORT_ENABLED`] || false,
    templatesEnabled: CONTENT_TOOL_FLAGS[`${toolUpper}_TEMPLATES_ENABLED`] || false,
  };
}

export function areAllToolsEnabled(): boolean {
  return [
    CONTENT_TOOL_FLAGS.PRESENTATION_ENABLED,
    CONTENT_TOOL_FLAGS.RESUME_ENABLED,
    CONTENT_TOOL_FLAGS.EBOOK_ENABLED,
    CONTENT_TOOL_FLAGS.SOCIAL_ENABLED,
    CONTENT_TOOL_FLAGS.EMAIL_ENABLED,
    CONTENT_TOOL_FLAGS.COVER_LETTER_ENABLED,
  ].every(Boolean);
}
