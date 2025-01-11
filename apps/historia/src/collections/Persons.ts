import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { story } from '../fields/story';
import { image } from '../fields/image';
import { bio } from '@/fields/bio';
import { slugField } from '@/fields/slug';
import resourceId from '@/fields/resourceId';

export const Persons: CollectionConfig = {
  slug: 'persons',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.given_name || data.middle_name || data.family_name) {
          const givenName = data.given_name || originalDoc?.given_name || '';
          const middleName = data.middle_name || originalDoc?.middle_name || '';
          const familyName = data.family_name || originalDoc?.family_name || '';
          data.name = [givenName, middleName, familyName].filter(Boolean).join(' ');
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: {
        hidden: true,
      },
    },
    {
      label: 'Name',
      type: 'collapsible',
      fields: [
        {
          name: 'given_name',
          label: 'Given Name',
          type: 'text',
          required: true,
        },
        {
          name: 'middle_name',
          label: 'Middle Name',
          type: 'text',
        },
        {
          name: 'family_name',
          label: 'Family Name',
          type: 'text',
        },
      ],
    },
    image,
    bio,
    story,
    // ...slugField(['given_name', 'middle_name', 'family_name']),
    resourceId
  ],
};
