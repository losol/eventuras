import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { siteEditors } from '@/access/siteRoleAccess';
import { accessOR } from '@/access/utils/accessOR';
import { endDate } from '@/fields/endDate';
import { image } from '@/fields/image';
import { lead } from '@/fields/lead';
import { partners } from '@/fields/partners';
import { publishedAt } from '@/fields/publishedAt';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { startDate } from '@/fields/startDate';
import { storyField } from '@/fields/story';
import { title } from '@/fields/title';
import { seoTab } from '@/lib/payload-plugin-seo';

import { revalidateDelete, revalidatePage } from './hooks/revalidateProject';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';


export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: accessOR(admins, siteEditors),
    read: anyone,
    readVersions: admins,
    update: accessOR(admins, siteEditors),
    delete: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
            lead,
            image,
            storyField(),
            startDate,
            endDate,
            partners,
          ],
        },
        {
          label: 'Meta',
          fields: [
            ...slugField(),
            resourceId,
            publishedAt,
          ],
        },
        seoTab(),
      ],
    },
  ],
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
