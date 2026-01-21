import type { CollectionConfig } from 'payload';

import { bio } from '@/fields/bio';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { image } from '../fields/image';
import { storyField} from '../fields/story';

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
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
      label: 'Name',
      admin: {
        hidden: true,
        components: {
          Field: {
            path: '@/fields/PersonNameComponent#PersonNameComponent',
          },
        },
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
    storyField(),
    ...slugField("name"),
    resourceId
  ],
};
