import { CollectionConfig } from 'payload/types';
import { admins, anyone } from '../access';

export const Licenses: CollectionConfig = {
  slug: 'licenses',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'abbreviation',
      type: 'text',
      admin: {
        description: 'A short abbreviation or acronym for the license (e.g., GPL for GNU Public License)',
      }
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'url',
      type: 'text',
    },
  ],
};
