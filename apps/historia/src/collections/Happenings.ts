import type { CollectionConfig } from 'payload';
import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { config } from '@/fields/config';
import { story } from '@/fields/story';
import { contentLocations } from '@/fields/contentLocations';
import { image } from '@/fields/image';
import { program } from '@/fields/program';
import { startDate } from '@/fields/startDate';
import { endDate } from '@/fields/endDate';
import { title } from '@/fields/title';
import { lead } from '@/fields/lead';
import { slugField } from '@/fields/slug';


export const Happenings: CollectionConfig = {
  slug: 'happenings',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    title,
    lead,
    image,
    story,
    startDate,
    endDate,
    program,
    contentLocations,
    ...slugField(),
    config,
  ],
};
