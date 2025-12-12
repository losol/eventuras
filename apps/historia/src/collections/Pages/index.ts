import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { Archive } from "@/blocks/ArchiveBlock/config";
import { Content } from "@/blocks/Content/config";
import { Image } from '@/blocks/Image/config';
import { Product } from '@/blocks/Product/config';
import { contributors } from '@/fields/contributors';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import { license } from '@/fields/license';
import { name } from '@/fields/name';
import { publishedAt } from '@/fields/publishedAt';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';

import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';


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
    preview: (data, { req }) => {
      return generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      });
    },
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
            storyField([Archive, Content, Image, Product])
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
