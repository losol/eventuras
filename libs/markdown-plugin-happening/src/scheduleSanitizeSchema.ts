/**
 * Sanitize schema extension for schedule elements.
 *
 * Merge this with rehype-sanitize's `defaultSchema` to allow `schedule-list`
 * and `schedule-item` elements through sanitization.
 */
export const scheduleSanitizeSchema = {
  tagNames: ['schedule-list', 'schedule-item'],
  attributes: {
    'schedule-item': [
      'data-time',
      'data-title',
      'data-speaker',
      'data-description',
    ],
  },
};
