import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { story } from '../fields/story';

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
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'City', value: 'city' },
        { label: 'Hotel', value: 'hotel' },
        { label: 'House', value: 'house' },
      ],
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'postalAddress',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    story
  ],
};

