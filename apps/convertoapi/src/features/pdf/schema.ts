import { z } from 'zod';
import errorMessages from './errors.js';

const paperFormats = z.enum([
  'Letter',
  'Legal',
  'Tabloid',
  'Ledger',
  'A0',
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
]);

const schema = z
  .object({
    // Ensure HTML is a string if provided
    html: z.string().optional(),
    // Ensure URL is valid if provided
    url: z.string().url().optional(),
    // Enforce scale range within the schema itself
    scale: z.number().min(0.1).max(2).default(1),
    format: paperFormats.default('A4'),
  })
  .refine(data => data.html || data.url, {
    // Ensure either HTML or URL is provided
    message: errorMessages.URL_HTML_REQUIRED,
  })
  .refine(data => !(data.html && data.url), {
    // Ensure not both HTML and URL are provided
    message: errorMessages.ONLY_URL_OR_HTML,
  });

export default schema;
