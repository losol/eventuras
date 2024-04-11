import { CollectionConfig } from 'payload/types';
import { admins } from '../access/admins';

const Happenings: CollectionConfig = {
  slug: 'happenings',
  access: {
    read: () => true,
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
    {
      name: 'places',
      label: 'Places',
      type: 'relationship',
      relationTo: 'places',
      hasMany: true,
    },
  ],
};

export default Happenings;
