import { Field } from 'payload';

/**
 * SEO meta fields for Open Graph and social sharing
 *
 * Provides title, description, and image fields optimized for search engines
 * and social media platforms.
 */
export const metaField: Field = {
  name: 'meta',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Meta Title',
      type: 'text',
      localized: true,
      maxLength: 60,
      admin: {
        description: '50-60 characters recommended for optimal display in search results. Leave empty to auto-generate from title.',
      },
    },
    {
      name: 'description',
      label: 'Meta Description',
      type: 'textarea',
      localized: true,
      maxLength: 160,
      admin: {
        description: '150-160 characters recommended for search result snippets. Leave empty to use excerpt or lead text.',
      },
    },
    {
      name: 'image',
      label: 'Social Share Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image used when sharing on social media (Facebook, LinkedIn, Twitter). Recommended: Use the "socialShare" format (1200×630px) for best results. Leave empty to use featured image.',
      },
    },
  ],
};

/**
 * SEO tab configuration
 *
 * Creates a separate tab in the admin UI for SEO fields, keeping content
 * and SEO concerns cleanly separated.
 *
 * @returns Tab configuration object (not a Field)
 */
export const seoTab = () => ({
  label: 'SEO',
  description: 'Optimize how your content appears in search engines and social media',
  fields: [metaField],
});
