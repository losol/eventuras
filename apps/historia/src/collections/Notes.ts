import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { image } from '../fields/image';
import { richText } from '@/fields/richText';
import { slugField } from '@/slug';
import { topics } from '@/fields/topics';
import { title } from '@/fields/title';
import { relatedContent } from '@/fields/relatedContent';

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
    richText(),
    topics,
    relatedContent,
    ...slugField(),
  ],
};

