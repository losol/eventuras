import type { Template, TemplateRegistry } from '../types';
import { defaultEmailTemplates } from './email';
import { defaultSmsTemplates } from './sms';

/**
 * Combined default templates
 */
export const defaultTemplates: TemplateRegistry = {
  ...defaultEmailTemplates,
  ...defaultSmsTemplates,
};

/**
 * Export individual template collections
 */
export { defaultEmailTemplates } from './email';
export { defaultSmsTemplates } from './sms';

/**
 * Get a default template by key
 */
export function getDefaultTemplate(key: string): Template | undefined {
  return defaultTemplates[key];
}

/**
 * Check if a default template exists
 */
export function hasDefaultTemplate(key: string): boolean {
  return key in defaultTemplates;
}

/**
 * Get all default template keys
 */
export function getDefaultTemplateKeys(): string[] {
  return Object.keys(defaultTemplates);
}
