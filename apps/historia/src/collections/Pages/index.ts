import type { CollectionConfig } from 'payload';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';
import { admins } from '@/access/admins';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { story } from '@/fields/story';
import { contributors } from '@/fields/contributor';
import { license } from '@/fields/license';

import { anyone } from '@/access/anyone';
import { publishedAt } from '@/publishedOn';
import { title } from '@/fields/title';

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: admins,
    read: anyone,
    readVersions: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
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
            story
          ],
        },
        {
          label: 'Meta',
          fields: [
            ...slugField(),
            contributors,
            license,
            publishedAt
          ]
        },
      ],
    }],
  defaultPopulate: {
    title: true,
    slug: true,
  },
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1000,
      },
    },
  },
};