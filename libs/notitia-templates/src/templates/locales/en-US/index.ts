import type { TemplateRegistry } from '../../../types';
import { emailTemplatesEnUS } from './email';
import { smsTemplatesEnUS } from './sms';

/**
 * Combined American English templates
 */
export const templatesEnUS: TemplateRegistry = {
  ...emailTemplatesEnUS,
  ...smsTemplatesEnUS,
};

export { emailTemplatesEnUS, smsTemplatesEnUS };
