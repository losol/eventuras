import type { CollectionConfig } from 'payload';

import resourceId from '@/fields/resourceId';
import { richText } from '@/fields/richText';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { siteEditors } from '../access/siteRoleAccess';
import { accessOR } from '../access/utils/accessOR';

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'quotes',
          req,
        });
        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        collection: 'quotes',
        req,
      });
      return path;
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data;

        // Auto-generate title from author + resourceId
        const titleParts: string[] = [];

        // Get author name from person relationship or text field
        if (data.author) {
          try {
            const authorId = typeof data.author === 'object' ? data.author.value : data.author;

            const authorDoc = await req.payload.findByID({
              collection: 'persons',
              id: authorId,
            });

            if (authorDoc?.name) {
              titleParts.push(authorDoc.name);
            }
          } catch (error) {
            // Author not found, skip
          }
        }

        // Use attributionText if no author
        if (titleParts.length === 0 && data.attributionText) {
          titleParts.push(data.attributionText);
        }

        // Add resourceId if exists
        if (data.resourceId) {
          titleParts.push(`#${data.resourceId}`);
        }

        // Fallback to "Quote"
        if (titleParts.length === 0) {
          titleParts.push('Quote');
        }

        data.title = titleParts.join(' - ');

        return data;
      },
    ],
  },
  access: {
    read: anyone,
    create: accessOR(admins, siteEditors),
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            // Auto-generated title (hidden)
            {
              name: 'title',
              type: 'text',
              required: false,
              admin: {
                hidden: true,
              },
            },

            // The quote itself
            richText({
              name: 'quote',
              localized: true,
              label: 'Quote',
              required: true,
            }),

            // Author (person)
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'persons',
              label: 'Author',
              admin: {
                description: 'Person who said/wrote this. For complex sources with multiple contributors, create a Source entry.',
              },
            },

            // Attribution text
            {
              name: 'attributionText',
              type: 'text',
              label: 'Attribution',
              localized: true,
              admin: {
                description: 'Use when author is not in database (e.g., "World Health Organization", "Anonymous", "Often attributed to Mark Twain")',
                condition: (data) => !data.author,
              },
            },

            // Source
            {
              name: 'source',
              type: 'relationship',
              relationTo: 'sources',
              label: 'Source',
            },

            // Locator (page number, timestamp, etc.)
            {
              name: 'locator',
              type: 'text',
              label: 'Locator',
              localized: true,
              admin: {
                description: 'Specific location in source (e.g., "p. 42", "ch. 3", "01:23:45")',
                condition: (data) => !!data.source,
              },
            },

            // Context
            {
              name: 'context',
              type: 'textarea',
              localized: true,
              label: 'Context',
              admin: {
                description: 'Optional context about when/where the quote was said',
              },
            },

            // Resource ID
            resourceId,
          ],
        },
      ],
    },
  ],
};
