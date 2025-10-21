import type { CollectionConfig } from 'payload';

import { description } from '@/fields/description';
import { geoPoint } from '@/fields/geopoint';
import { image } from '@/fields/image';
import resourceId from '@/fields/resourceId';
import { slugField } from '@/fields/slug';
import { storyField } from '@/fields/story';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';

export const Places: CollectionConfig = {
  slug: 'places',
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
    description,
    image,
    {
      label: 'Postal Address',
      type: 'collapsible',
      fields: [{
        name: 'postalAddress',
        type: 'group',
        fields: [
          { name: 'streetAddress', type: 'text' },
          { name: 'region', type: 'text' },
          { name: 'postalCode', type: 'text' },
          { name: 'city', type: 'text' },
          { name: 'country', type: 'text' },
        ],
      },
      ]
    },
    {
      label: 'Geo point',
      type: 'collapsible',
      fields: [geoPoint],
    },
    storyField(),
    ...slugField(),
    resourceId
  ],
};

