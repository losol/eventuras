/**
 * Custom Playwright reporter that generates an error-context.md file for each failed test.
 *
 * Designed for AI agent debugging: provides structured, human-readable context
 * with all sensitive data (tokens, secrets, emails) redacted.
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

/** Patterns that indicate sensitive values to redact */
const SENSITIVE_PATTERNS = [
  /Bearer\s+[a-z0-9\-_.]+/gi,
  /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, // JWTs
  /session=[a-z0-9\-_.%]+/gi,
  /token[=:]\s*["']?[a-z0-9\-_.]+["']?/gi,
  /secret[=:]\s*["']?[a-z0-9\-_.]+["']?/gi,
  /password[=:]\s*["']?[^\s"']+["']?/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // email addresses
  /refresh_token[=:]\s*["']?[a-z0-9\-_.]+["']?/gi,
  /code_verifier[=:]\s*["']?[a-z0-9\-_.]+["']?/gi,
];

function redact(text: string): string {
  let result = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, (match) => {
      // For emails, keep the structure but redact the local part
      if (match.includes('@')) {
        const [, domain] = match.split('@');
        return `***@${domain}`;
      }
      // For key=value patterns, keep the key
      const eqIdx = match.search(/[=:]/);
      if (eqIdx > 0) {
        return match.substring(0, eqIdx + 1) + ' [REDACTED]';
      }
      return '[REDACTED]';
    });
  }
  return result;
}

/** Sanitize env vars: only include E2E_ prefixed ones, redact values that look sensitive */
function sanitizeEnvVars(): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('E2E_')) continue;
    if (!value) continue;

    // Redact values for keys that contain sensitive words
    if (/secret|token|password|key|credential/i.test(key)) {
      safe[key] = '[REDACTED]';
    } else {
      safe[key] = redact(value);
    }
  }
  return safe;
}

class ErrorContextReporter implements Reporter {
  private outputDir = 'tmp/results';

  onBegin(config: FullConfig, _suite: Suite): void {
    // Use Playwright's configured outputDir to stay in sync with playwright.config.ts
    this.outputDir = config.projects[0]?.outputDir ?? this.outputDir;
    mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;

    const context = this.buildErrorContext(test, result);
    const safeName = test.title.replaceAll(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80);
    const contextPath = join(
      this.outputDir,
      result.workerIndex.toString(),
      `${safeName}-error-context.md`
    );

    mkdirSync(dirname(contextPath), { recursive: true });
    writeFileSync(contextPath, context, 'utf-8');

    // Also attach to the test result so it appears in the HTML report
    result.attachments.push({
      name: 'error-context.md',
      contentType: 'text/markdown',
      path: contextPath,
    });
  }

  onEnd(_result: FullResult): void {
    // No-op
  }

  private buildErrorContext(test: TestCase, result: TestResult): string {
    const lines: string[] = [];
    const error = result.errors[0];

    lines.push(
      '# Test Failure Context',
      '',
      `**Test:** ${test.title}`,
      `**Suite:** ${test.parent.title}`,
      `**File:** ${test.location.file}:${test.location.line}`,
      `**Project:** ${test.parent.project()?.name ?? 'unknown'}`,
      `**Status:** ${result.status}`,
      `**Duration:** ${result.duration}ms`,
      `**Started:** ${new Date(result.startTime).toISOString()}`,
      `**Retry:** ${result.retry}`,
      '',
    );

    // Error details
    if (error) {
      lines.push(
        '## Error',
        '',
        '```',
        redact(error.message ?? 'No error message'),
        '```',
        '',
      );

      if (error.stack) {
        lines.push('## Stack Trace', '', '```');
        // Only include the first 30 lines of the stack trace
        const stackLines = redact(error.stack).split('\n').slice(0, 30);
        lines.push(stackLines.join('\n'), '```', '');
      }

      // Extract snippet if available
      if (error.snippet) {
        lines.push(
          '## Code Snippet',
          '',
          '```typescript',
          redact(error.snippet),
          '```',
          '',
        );
      }
    }

    // Steps taken before failure
    if (result.steps.length > 0) {
      lines.push('## Steps', '');
      const flatSteps = this.flattenSteps(result.steps);
      for (const step of flatSteps.slice(-20)) {
        const status = step.error ? 'FAIL' : 'OK';
        const duration = step.duration > 0 ? ` (${step.duration}ms)` : '';
        lines.push(`- [${status}] ${redact(step.title)}${duration}`);
      }
      lines.push('');
    }

    // Attachments (list paths to screenshots, traces, videos)
    const attachments = result.attachments.filter(a => a.name !== 'error-context.md');
    if (attachments.length > 0) {
      lines.push('## Attachments', '');
      for (const att of attachments) {
        if (att.path) {
          lines.push(`- **${att.name}** (${att.contentType}): \`${att.path}\``);
        }
      }
      lines.push('');
    }

    // Stdout/stderr
    if (result.stdout.length > 0) {
      lines.push('## Stdout', '', '```');
      const stdout = result.stdout.map(s => (typeof s === 'string' ? s : s.toString())).join('');
      lines.push(redact(stdout).substring(0, 2000), '```', '');
    }

    if (result.stderr.length > 0) {
      lines.push('## Stderr', '', '```');
      const stderr = result.stderr.map(s => (typeof s === 'string' ? s : s.toString())).join('');
      lines.push(redact(stderr).substring(0, 2000), '```', '');
    }

    // Environment (sanitized)
    lines.push('## Environment', '');
    const envVars = sanitizeEnvVars();
    for (const [key, value] of Object.entries(envVars)) {
      lines.push(`- \`${key}\`: ${value}`);
    }
    lines.push('');

    return lines.join('\n');
  }

  private flattenSteps(
    steps: TestResult['steps'],
    depth = 0
  ): Array<{ title: string; duration: number; error?: Error }> {
    const result: Array<{ title: string; duration: number; error?: Error }> = [];
    for (const step of steps) {
      const indent = '  '.repeat(depth);
      result.push({
        title: `${indent}${step.title}`,
        duration: step.duration,
        error: step.error,
      });
      if (step.steps.length > 0) {
        result.push(...this.flattenSteps(step.steps, depth + 1));
      }
    }
    return result;
  }
}

export default ErrorContextReporter;
