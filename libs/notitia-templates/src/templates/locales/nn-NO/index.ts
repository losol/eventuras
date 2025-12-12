import type { TemplateRegistry } from '../../../types';
import { emailTemplatesNnNO } from './email';
import { smsTemplatesNnNO } from './sms';

/**
 * Combined Norwegian Nynorsk templates
 */
export const templatesNnNO: TemplateRegistry = {
  ...emailTemplatesNnNO,
  ...smsTemplatesNnNO,
};

export { emailTemplatesNnNO, smsTemplatesNnNO };
