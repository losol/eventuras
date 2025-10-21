import type { CollectionConfig } from 'payload';

import { relatedContent } from '@/fields/relatedContent';
import resourceId from '@/fields/resourceId';
import { richText } from '@/fields/richText';
import { slugField } from '@/fields/slug';
import { title } from '@/fields/title';
import { topics } from '@/fields/topics';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { image } from '../fields/image';


export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    title,
    image,
    richText({ name: 'content', localized: true }),
    topics,
    relatedContent,
    ...slugField(),
    resourceId
  ],
};

