import { CollectionConfig } from 'payload/types';

const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the organization.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A description of the organization.',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'The URL of the organization\'s official website.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The logo of the organization.',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'places',
      admin: {
        description: 'The location of the organization.',
      },
    },
    {
      name: 'parentOrganization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'The parent organization of this organization.',
      },
    },
  ],
};

export default Organizations;
