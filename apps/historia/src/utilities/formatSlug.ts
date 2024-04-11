import type { FieldHook } from 'payload/types';
// From https://github.com/payloadcms/website-cms/blob/main/src/utilities/formatSlug.ts

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase();

const formatSlug =
  (fallback: string): FieldHook =>
    ({ operation, value, originalDoc, data }) => {
      if (typeof value === 'string') {
        return format(value);
      }

      if (operation === 'create') {
        const fallbackData = data?.[fallback] || originalDoc?.[fallback];

        if (fallbackData && typeof fallbackData === 'string') {
          return format(fallbackData);
        }
      }

      return value;
    };

export default formatSlug;
