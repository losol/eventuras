/**
 * Supported notification channels
 */
export type NotificationChannel = 'email' | 'sms';

/**
 * Template types for different notification scenarios
 */
export type TemplateType =
  | 'welcome'
  | 'registration-confirmation'
  | 'event-reminder'
  | 'payment-confirmation'
  | 'password-reset'
  | 'order-confirmation'
  | 'order-shipped'
  | 'custom';

/**
 * Template identifier combining channel and type
 */
export interface TemplateIdentifier {
  channel: NotificationChannel;
  type: TemplateType;
}

/**
 * Base template parameters that all templates can use
 */
export interface BaseTemplateParams {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Template definition with content and optional metadata
 */
export interface Template {
  /**
   * Handlebars template string
   */
  content: string;

  /**
   * Optional subject line (primarily for email)
   */
  subject?: string;

  /**
   * Optional description of the template
   */
  description?: string;
}

/**
 * Rendered template result
 */
export interface RenderedTemplate {
  /**
   * The rendered content
   */
  content: string;

  /**
   * The rendered subject (if applicable)
   */
  subject?: string;
}

/**
 * Template registry for storing templates
 */
export interface TemplateRegistry {
  [key: string]: Template;
}

/**
 * Options for template rendering
 */
export interface RenderOptions {
  /**
   * Strict mode - throws error if variable is missing
   * @default false
   */
  strict?: boolean;

  /**
   * Custom helpers for Handlebars
   */
  helpers?: {
    [name: string]: Handlebars.HelperDelegate;
  };
}
