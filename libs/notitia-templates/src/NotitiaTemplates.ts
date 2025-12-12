import Handlebars from 'handlebars';
import type {
  BaseTemplateParams,
  Locale,
  NotificationChannel,
  RenderOptions,
  RenderedTemplate,
  Template,
  TemplateRegistry,
  TemplateType,
} from './types';
import { defaultTemplates, getTemplatesForLocale } from './templates';

/**
 * Template renderer for generating notification messages
 */
export class NotitiaTemplates {
  private customTemplates: TemplateRegistry = {};
  private handlebarsInstance: typeof Handlebars;
  private defaultLocale: Locale = 'en-US';

  constructor(defaultLocale: Locale = 'en-US') {
    this.defaultLocale = defaultLocale;
    // Create a new Handlebars instance to avoid global pollution
    this.handlebarsInstance = Handlebars.create();
    this.registerDefaultHelpers();
  }

  /**
   * Register default Handlebars helpers
   */
  private registerDefaultHelpers(): void {
    // Helper for formatting dates
    this.handlebarsInstance.registerHelper('formatDate', (date: string) => {
      if (!date) return '';
      try {
        return new Date(date).toLocaleDateString();
      } catch {
        return date;
      }
    });

    // Helper for uppercase
    this.handlebarsInstance.registerHelper('upper', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Helper for lowercase
    this.handlebarsInstance.registerHelper('lower', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    // Helper for conditional equality
    this.handlebarsInstance.registerHelper('eq', (a: unknown, b: unknown) => {
      return a === b;
    });
  }

  /**
   * Generate a template key from channel and type
   */
  private getTemplateKey(channel: NotificationChannel, type: TemplateType): string {
    return `${channel}:${type}`;
  }

  /**
   * Get a template by key, checking custom templates first, then locale-specific defaults
   */
  private getTemplate(key: string, locale?: Locale): Template | undefined {
    if (this.customTemplates[key]) {
      return this.customTemplates[key];
    }
    
    const targetLocale = locale || this.defaultLocale;
    const localeTemplates = getTemplatesForLocale(targetLocale);
    return localeTemplates[key] || defaultTemplates[key];
  }

  /**
   * Register a custom template that will override the default
   */
  registerTemplate(channel: NotificationChannel, type: TemplateType, template: Template): void {
    const key = this.getTemplateKey(channel, type);
    this.customTemplates[key] = template;
  }

  /**
   * Register multiple custom templates at once
   */
  registerTemplates(templates: Record<string, Template>): void {
    this.customTemplates = { ...this.customTemplates, ...templates };
  }

  /**
   * Unregister a custom template (falls back to default if available)
   */
  unregisterTemplate(channel: NotificationChannel, type: TemplateType): void {
    const key = this.getTemplateKey(channel, type);
    delete this.customTemplates[key];
  }

  /**
   * Clear all custom templates
   */
  clearCustomTemplates(): void {
    this.customTemplates = {};
  }

  /**
   * Register a custom Handlebars helper
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebarsInstance.registerHelper(name, helper);
  }

  /**
   * Check if a template exists (custom or default)
   */
  hasTemplate(channel: NotificationChannel, type: TemplateType): boolean {
    const key = this.getTemplateKey(channel, type);
    return key in this.customTemplates || key in defaultTemplates;
  }

  /**
   * Render a template with the provided parameters
   */
  render(
    channel: NotificationChannel,
    type: TemplateType,
    params: BaseTemplateParams,
    options: RenderOptions = {}
  ): RenderedTemplate {
    const key = this.getTemplateKey(channel, type);
    const locale = options.locale || this.defaultLocale;
    const template = this.getTemplate(key, locale);

    if (!template) {
      throw new Error(`Template not found: ${key} for locale: ${locale}`);
    }

    try {
      // Register custom helpers if provided
      if (options.helpers) {
        Object.entries(options.helpers).forEach(([name, helper]) => {
          this.handlebarsInstance.registerHelper(name, helper);
        });
      }

      // Compile and render content
      const contentTemplate = this.handlebarsInstance.compile(template.content, {
        strict: options.strict ?? false,
        noEscape: true, // Don't HTML-escape (we're generating plain text)
      });
      const content = contentTemplate(params);

      // Compile and render subject if present
      let subject: string | undefined;
      if (template.subject) {
        const subjectTemplate = this.handlebarsInstance.compile(template.subject, {
          strict: options.strict ?? false,
          noEscape: true,
        });
        subject = subjectTemplate(params);
      }

      // Unregister custom helpers to avoid pollution
      if (options.helpers) {
        Object.keys(options.helpers).forEach((name) => {
          this.handlebarsInstance.unregisterHelper(name);
        });
      }

      return {
        content: content.trim(),
        subject: subject?.trim(),
      };
    } catch (error) {
      throw new Error(
        `Failed to render template ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Render a custom template string directly (not from registry)
   */
  renderCustom(templateString: string, params: BaseTemplateParams, options: RenderOptions = {}): string {
    try {
      // Register custom helpers if provided
      if (options.helpers) {
        Object.entries(options.helpers).forEach(([name, helper]) => {
          this.handlebarsInstance.registerHelper(name, helper);
        });
      }

      const template = this.handlebarsInstance.compile(templateString, {
        strict: options.strict ?? false,
        noEscape: true,
      });
      const result = template(params);

      // Unregister custom helpers
      if (options.helpers) {
        Object.keys(options.helpers).forEach((name) => {
          this.handlebarsInstance.unregisterHelper(name);
        });
      }

      return result.trim();
    } catch (error) {
      throw new Error(
        `Failed to render custom template: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get all available template keys (custom and default)
   */
  getAvailableTemplates(): string[] {
    const defaultKeys = Object.keys(defaultTemplates);
    const customKeys = Object.keys(this.customTemplates);
    return Array.from(new Set([...defaultKeys, ...customKeys])).sort();
  }

  /**
   * Get template metadata (without rendering)
   */
  getTemplateInfo(channel: NotificationChannel, type: TemplateType): Template | undefined {
    const key = this.getTemplateKey(channel, type);
    return this.getTemplate(key);
  }
}

/**
 * Create a new NotitiaTemplates instance
 */
export function createNotitiaTemplates(defaultLocale: Locale = 'en-US'): NotitiaTemplates {
  return new NotitiaTemplates(defaultLocale);
}

/**
 * Default singleton instance for convenience (uses en-US)
 */
export const notitiaTemplates = new NotitiaTemplates('en-US');
