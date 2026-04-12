import type { TemplateRegistry } from '../../../types';
import { emailTemplatesNbNO } from './email';
import { smsTemplatesNbNO } from './sms';

/**
 * Combined Norwegian Bokmål templates
 */
export const templatesNbNO: TemplateRegistry = {
  ...emailTemplatesNbNO,
  ...smsTemplatesNbNO,
};

export { emailTemplatesNbNO } from './email';
export { smsTemplatesNbNO } from './sms';
