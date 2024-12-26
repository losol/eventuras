import type { CollectionConfig } from 'payload';

import { authenticated } from '../../access/authenticated';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { revalidateArticle } from './hooks/revalidateArticle';

import { slugField } from '@/fields/slug';
import { story } from '@/fields/story';
import { image } from '@/fields/image';
import { contributors } from '@/fields/contributor';
import { license } from '@/fields/license';
import { topics } from '@/fields/topics';
import { lead } from '@/fields/lead';
import { publishedOnly } from '@/access/publishedOnly';
import { admins } from '@/access/admins';
import { contentPersons } from '@/contentPersons';
import { contentLocations } from '@/contentLocations';
import { relatedContent } from '@/fields/relatedContent';
import { publishedAt } from '@/fields/publishedAt';
import { title } from '@/fields/title';

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
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'articles',
          req,
        });

        return `${process.env.NEXT_PUBLIC_CMS_URL}${path}`;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'articles',
        req
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
            title,
            image,
            lead,
            story,

          ]
        },
        {
          label: 'Meta',
          fields: [
            publishedAt,
            ...slugField(),
            contributors,
            contentPersons,
            contentLocations,
            license,
            topics,
            relatedContent,
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
        interval: 1000,
      },
    }
  }
};