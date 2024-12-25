import type { CollectionConfig } from 'payload';

import { authenticated } from '../../access/authenticated';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { revalidateArticle } from './hooks/revalidateArticle';

import { slugField } from '@/fields/slug';
import { story } from '@/fields/story';
import { featuredImage } from '@/fields/featuredImage';
import { contributors } from '@/fields/contributor';
import { license } from '@/fields/license';
import { topics } from '@/fields/topics';
import { lead } from '@/fields/lead';
import { publishedOnly } from '@/access/publishedOnly';
import { admins } from '@/access/admins';

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: authenticated,
    read: publishedOnly,
    readVersions: admins,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'articles',
        });

        return `${process.env.NEXT_PUBLIC_CMS_URL}${path}`;
      },
    },
    preview: (data) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'articles',
      });

      return `${process.env.NEXT_PUBLIC_CMS_URL}${path}`;
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            featuredImage,
            lead,
            story,

          ]
        },
        {
          label: 'Meta',
          fields: [
            ...slugField(),
            contributors,
            license,
            topics,
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'relatedArticles',
              type: 'relationship',
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                };
              },
              hasMany: true,
              relationTo: 'articles',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateArticle],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    }
  }
};
