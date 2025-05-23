import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { storyField } from '@/fields/story';
import { geoPoint } from '@/fields/geopoint';
import { description } from '@/fields/description';
import { slugField } from '@/fields/slug';
import resourceId from '@/fields/resourceId';
import { image } from '@/fields/image';

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

