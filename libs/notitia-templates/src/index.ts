// Main exports
export { NotitiaTemplates, createNotitiaTemplates, notitiaTemplates } from './NotitiaTemplates';

// Types
export type {
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
} from './defaultTemplates';
