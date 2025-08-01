import type { CollectionConfig } from 'payload';
import { populatePublishedAt } from '../../hooks/populatePublishedAt';
import { revalidateDelete, revalidatePage } from './hooks/revalidateProject';
import { admins } from '@/access/admins';
import { slugField } from '@/fields/slug';
import { image } from '@/fields/image';
import { storyField } from '@/fields/story';

import { anyone } from '@/access/anyone';
import { publishedAt } from '@/fields/publishedAt';
import { title } from '@/fields/title';
import { startDate } from '@/fields/startDate';
import { endDate } from '@/fields/endDate';
import { partners } from '@/fields/partners';
import { lead } from '@/fields/lead';
import resourceId from '@/fields/resourceId';


export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: admins,
    read: anyone,
    readVersions: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    title,
    lead,
    image,
    storyField(),
    startDate,
    endDate,
    partners,
    ...slugField(),
    resourceId,
    publishedAt,
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
