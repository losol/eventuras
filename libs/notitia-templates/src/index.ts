// Main exports
export { NotitiaTemplates, createNotitiaTemplates, notitiaTemplates } from './NotitiaTemplates';

// Types
export type {
  Locale,
  NotificationChannel,
  TemplateType,
  TemplateIdentifier,
  BaseTemplateParams,
  Template,
  RenderedTemplate,
  TemplateRegistry,
  RenderOptions,
} from './types';

// Default templates
export {
  defaultTemplates,
  defaultEmailTemplates,
  defaultSmsTemplates,
  getDefaultTemplate,
  hasDefaultTemplate,
  getDefaultTemplateKeys,
  localeTemplates,
  getTemplatesForLocale,
  templatesEnUS,
  templatesNbNO,
  templatesNnNO,
} from './templates';
