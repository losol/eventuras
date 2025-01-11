import type { CollectionConfig } from 'payload';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';
import { admins } from '@/access/admins';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { story } from '@/fields/story';
import { contributors } from '@/fields/contributors';
import { license } from '@/fields/license';

import { anyone } from '@/access/anyone';
import { publishedAt } from '@/fields/publishedAt';
import { title } from '@/fields/title';
import { lead } from '@/fields/lead';
import { name } from '@/fields/name';
import resourceId from '@/fields/resourceId';

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
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            name,
            title,
            lead,
            image,
            story
          ],
        },
        {
          label: 'Meta',
          fields: [
            ...slugField("name"),
            resourceId,
            license,
            contributors,
            publishedAt
          ]
        },
      ],
    }],
  defaultPopulate: {
    title: true,
    slug: true,
    breadcrumbs: true,
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
