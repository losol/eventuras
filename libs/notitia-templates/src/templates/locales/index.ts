import type { Locale, TemplateRegistry } from '../../types';
import { templatesEnUS } from './en-US';
import { templatesNbNO } from './nb-NO';
import { templatesNnNO } from './nn-NO';

/**
 * Map of locale to template registry
 */
export const localeTemplates: Record<Locale, TemplateRegistry> = {
  'en-US': templatesEnUS,
  'nb-NO': templatesNbNO,
  'nn-NO': templatesNnNO,
};

/**
 * Get templates for a specific locale
 */
export function getTemplatesForLocale(locale: Locale): TemplateRegistry {
  return localeTemplates[locale];
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return locale in localeTemplates;
}

// Export individual locale templates
export { templatesEnUS } from './en-US';
export { templatesNbNO } from './nb-NO';
export { templatesNnNO } from './nn-NO';
