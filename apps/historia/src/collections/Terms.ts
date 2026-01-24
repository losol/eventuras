import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import resourceId from '@/fields/resourceId';
import { richText } from '@/fields/richText';
import { slugField } from '@/fields/slug';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';

export const Terms: CollectionConfig = {
  slug: 'terms',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'terms',
          req,
        });
        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        collection: 'terms',
        req,
      });
      return path;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        // Auto-generate title from term + context
        if (data.term) {
          data.title = data.context ? `${data.term} (${data.context})` : data.term;
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: {
      autosave: true,
    },
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
            // Core term identification
            {
              name: 'term',
              type: 'text',
              required: true,
              label: 'Term',
              admin: {
                description:
                  'The term being defined (e.g., "Kildekritikk", "Database")',
              },
            },
            {
              name: 'context',
              type: 'text',
              required: false,
              label: 'Context',
              admin: {
                description:
                  'Optional context/specialization (e.g., "historical method", "media studies"). Leave empty for general terms.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: false,
              admin: {
                hidden: true,
                readOnly: true,
              },
              // Auto-generated: "Kildekritikk" or "Kildekritikk (historical method)"
            },

            // Definitions array (supports multiple meanings)
            {
              name: 'definitions',
              type: 'array',
              required: true,
              minRows: 1,
              label: 'Definitions',
              admin: {
                description:
                  'Add multiple definitions if the term has different meanings within the same context.',
              },
              fields: [
                richText({
                  name: 'definition',
                  localized: true,
                  label: 'Definition',
                  required: true,
                }),
                {
                  name: 'shortDefinition',
                  type: 'text',
                  maxLength: 200,
                  required: true,
                  localized: true,
                  label: 'Short Definition',
                  admin: {
                    description:
                      'Concise definition for tooltips and previews (max 200 characters)',
                  },
                },
                {
                  name: 'variant',
                  type: 'text',
                  label: 'Variant',
                  admin: {
                    description:
                      'Optional sub-context or variant (e.g., "early period", "modern usage", "legal")',
                  },
                },
                {
                  name: 'isPrimary',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Primary Definition',
                  admin: {
                    description:
                      'Show this definition by default in tooltips and previews',
                  },
                },
                {
                  name: 'sources',
                  type: 'relationship',
                  relationTo: 'sources',
                  hasMany: true,
                  label: 'Sources',
                  admin: {
                    description: 'Authoritative sources for this definition',
                  },
                },
              ],
            },

            // Synonyms and alternatives
            {
              name: 'synonyms',
              type: 'array',
              label: 'Synonyms',
              admin: {
                description:
                  'Alternative terms, translations, or common misspellings',
              },
              fields: [
                {
                  name: 'synonym',
                  type: 'text',
                  required: true,
                },
              ],
            },

            // Semantic relationships
            {
              name: 'relatedTerms',
              type: 'relationship',
              relationTo: 'terms',
              hasMany: true,
              label: 'Related Terms',
              admin: {
                description:
                  'Semantically related concepts (broader, narrower, or related terms)',
              },
            },

            // Categorization
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              label: 'Category',
              admin: {
                description: 'Primary topic/discipline for this term',
              },
            },

            // Resource ID
            resourceId,
          ],
        },
        {
          label: 'SEO',
          fields: [...slugField('title')],
        },
      ],
    },
  ],
};
