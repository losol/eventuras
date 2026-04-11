import type { FieldHook } from 'payload';

import { slugify } from '@eventuras/core/string';

export { slugify as formatSlug };

export const formatSlugHook =
  (fallback: string): FieldHook =>
    ({ data, operation, originalDoc, value }) => {
      if (typeof value === 'string') {
        return slugify(value);
      }

      // If creating or no existing slug, fallback to another field
      if (operation === 'create' || !data?.slug) {
        const fallbackData = data?.[fallback];

        if (fallbackData && typeof fallbackData === 'string') {
          return slugify(fallbackData);
        }
      }

      return value;
    };
