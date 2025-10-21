import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { description } from '@/fields/description';
import { title } from '@/fields/title';
import { url } from '@/fields/url';

export const Licenses: CollectionConfig = {
  slug: 'licenses',
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
    {
      name: 'abbreviation',
      type: 'text',
      localized: true,
      admin: {
        description: 'A short abbreviation or acronym for the license (e.g., GPL for GNU Public License)',
      }
    },
    description,
    url,
  ],
};
