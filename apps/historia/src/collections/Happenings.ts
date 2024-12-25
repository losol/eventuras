import type { CollectionConfig } from 'payload';
import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { config } from '@/fields/config';
import { dictionary } from '@/fields/dictionary';
import { story } from '@/fields/story';
import { contentLocations } from '@/fields/contentLocations';
import { image } from '@/fields/image';
import { program } from '@/fields/program';

export const Happenings: CollectionConfig = {
  slug: 'happenings',
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
      admin: {
        placeholder: 'Enter the name of the event',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        placeholder: 'Provide a brief description of the event',
      },
    },
    image,
    story,
    {
      name: 'type',
      label: 'Event Type',
      type: 'select',
      options: [
        { label: 'Conference', value: 'conference' },
        { label: 'Educational', value: 'educational' },
        { label: 'Hackathon', value: 'hackathon' },
        { label: 'Social Event', value: 'social' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    program,
    contentLocations,
    config,
    dictionary,
  ],
};
