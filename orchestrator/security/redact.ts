/**
 * Multi-AI Orchestrator - Data Redaction
 * Phase D: Sensitive data protection
 */

const SENSITIVE_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit card
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
  /\bsk-[a-zA-Z0-9]{48}\b/g, // API keys (OpenAI pattern)
  /\bsk-ant-[a-zA-Z0-9-]{95}\b/g, // Anthropic keys
];

/**
 * Redact sensitive information
 */
export function redactSensitiveData(text: string, enabled: boolean = true): string {
  if (!enabled) return text;

  let redacted = text;
  
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  
  return redacted;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = 50000): string {
  if (!input) return '';
  
  // Truncate to max length
  let sanitized = input.slice(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Validate and sanitize workflow variables
 */
export function sanitizeWorkflowVariables(variables: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(variables)) {
    // Validate key
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      console.warn(`[Security] Invalid variable key: ${key}`);
      continue;
    }
    
    // Sanitize value
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeInput(v) : v
      );
    } else {
      sanitized[key] = JSON.stringify(value);
    }
  }
  
  return sanitized;
}
