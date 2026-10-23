/**
 * Input sanitization & security helpers for EventVerse AI
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /forget\s+all\s+rules/i,
  /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
];

export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  let sanitized = String(input);
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  // Strip null bytes
  sanitized = sanitized.replace(/\0/g, '');
  // Trim excessive whitespace
  return sanitized.trim();
}

export function detectPromptInjection(input: string): { isSuspicious: boolean; reason?: string } {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isSuspicious: true,
        reason: 'Detected unauthorized prompt override instruction.',
      };
    }
  }
  return { isSuspicious: false };
}

export function safeJsonParse<T>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}
