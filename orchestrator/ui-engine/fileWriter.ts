/**
 * File Writer - Safe File Generation
 * Phase Ω-III: Handles directory creation and file writing
 */

import fs from 'fs';
import path from 'path';

export async function safeWriteFile(filepath: string, content: string): Promise<void> {
  const dir = path.dirname(filepath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(filepath, content, 'utf-8');
}

export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
