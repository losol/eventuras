import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { Content } from '@/blocks/Content/config';
import { Image } from '@/blocks/Image/config';
import { image } from '@/fields/image';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { seoTab } from '@/lib/payload-plugin-seo';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';

export const Timelines: CollectionConfig = {
  slug: 'timelines',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          slug: typeof data?.slug === 'string' ? data.slug : undefined,
          collection: 'timelines',
          req,
        });
        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        slug: typeof data?.slug === 'string' ? data.slug : undefined,
        collection: 'timelines',
        req,
      });
      return path;
    },
  },
  access: {
    create: accessOR(admins, siteEditors),
    delete: admins,
    read: anyone,
    update: accessOR(admins, siteEditors),
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            // Title
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: 'Title',
              admin: {
                description:
                  'Short, descriptive title (e.g., "Grunnloven undertegnes", "French Revolution begins")',
              },
            },

            // Short summary for timeline tooltips
            {
              name: 'summary',
              type: 'textarea',
              maxLength: 300,
              localized: true,
              label: 'Summary',
              admin: {
                description: 'Brief summary for timeline tooltips and previews (max 300 characters)',
              },
            },

            // Rich description
            storyField([Content, Image]),

            // Featured image
            image,

            // Date/Time group
            {
              name: 'temporal',
              type: 'group',
              label: 'Date & Time',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  required: true,
                  label: 'Start Date',
                  admin: {
                    description: 'Date when this occurred (or began for multi-day entries)',
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: 'End Date',
                  admin: {
                    description: 'Optional end date for entries spanning multiple days/years',
                    condition: (data) => !!data.temporal?.startDate,
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'datePrecision',
                  type: 'select',
                  required: true,
                  defaultValue: 'exact',
                  label: 'Date Precision',
                  options: [
                    { label: 'Exact (day and time)', value: 'exact-time' },
                    { label: 'Exact (day)', value: 'exact' },
                    { label: 'Month', value: 'month' },
                    { label: 'Year', value: 'year' },
                    { label: 'Decade', value: 'decade' },
                    { label: 'Century', value: 'century' },
                    { label: 'Circa (approximate)', value: 'circa' },
                  ],
                  admin: {
                    description: 'How precise is the date?',
                  },
                },
                {
                  name: 'displayDate',
                  type: 'text',
                  localized: true,
                  label: 'Display Date (override)',
                  admin: {
                    description:
                      'Optional human-readable date (e.g., "Early 1800s", "Spring 1814", "ca. 1850"). Overrides auto-formatted date.',
                  },
                },
                {
                  name: 'isOngoing',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Ongoing',
                  admin: {
                    description: 'Check if this is still happening (no end date)',
                  },
                },
              ],
            },

            // Topics/categories
            {
              name: 'topics',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              label: 'Topics',
              admin: {
                description: 'Thematic categories (e.g., "Norwegian Constitution", "World War II")',
              },
            },

            // Related timeline entries
            {
              name: 'relatedEvents',
              type: 'array',
              label: 'Related Entries',
              admin: {
                description: 'Connect to other timeline entries (cause/effect, hierarchy)',
              },
              fields: [
                {
                  name: 'event',
                  type: 'relationship',
                  relationTo: 'timelines',
                  required: true,
                  label: 'Timeline Entry',
                },
                {
                  name: 'relationshipType',
                  type: 'select',
                  required: true,
                  label: 'Relationship',
                  options: [
                    { label: 'Caused by', value: 'caused_by' },
                    { label: 'Led to', value: 'led_to' },
                    { label: 'Part of', value: 'part_of' },
                    { label: 'Concurrent with', value: 'concurrent_with' },
                    { label: 'Related to', value: 'related_to' },
                  ],
                },
              ],
            },

            // Resource ID + slug
            ...slugField(),
            resourceId,
          ],
        },
        seoTab(),
      ],
    },
  ],
};
