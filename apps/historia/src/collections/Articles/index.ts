import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { publishedOnly } from '@/access/publishedOnly';
import { Content } from '@/blocks/Content/config';
import { Image } from '@/blocks/Image/config';
import { Product } from '@/blocks/Product/config';
import { contributors } from '@/fields/contributors';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import { license } from '@/fields/license';
import { publishedAt } from '@/fields/publishedAt';
import { relatedContent } from '@/fields/relatedContent';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';
import { topics } from '@/fields/topics';
import { seoTab } from '@/lib/payload-plugin-seo';

import { revalidateArticle } from './hooks/revalidateArticle';
import { authenticated } from '../../access/authenticated';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';


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
          resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
          collection: 'articles',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        resourceId: typeof data?.resourceId === 'string' ? data.resourceId : undefined,
        collection: 'articles',
        req
      });

      return path;
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
            storyField([Content, Image, Product]),
          ]
        },
        {
          label: 'Meta',
          fields: [
            publishedAt,
            ...slugField(),
            resourceId,
            license,
            contributors,
            topics,
            relatedContent,
          ],
        },
        seoTab(),
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
