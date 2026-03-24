/**
 * Sanitize schema extension for callout elements.
 *
 * Merge this with rehype-sanitize's `defaultSchema` to allow `callout`
 * elements through sanitization.
 */
export const calloutSanitizeSchema = {
  tagNames: ['callout'],
  attributes: {
    callout: ['data-callout-type'],
  },
};
