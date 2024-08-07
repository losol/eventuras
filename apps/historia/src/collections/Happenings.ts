import { CollectionConfig } from 'payload/types';
import { admins, anyone } from '../access';
import { config } from '../fields/config';
import { dictionary } from '../fields/dictionary';
import { story } from '../fields/story';
import { contentLocations } from '../fields/contentLocations';
import { featuredImage } from '../fields/featuredImage';
import { program } from '../fields/program';

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
    featuredImage,
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
