import { CollectionConfig } from 'payload/types';

const Persons: CollectionConfig = {
  slug: 'persons',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the person.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A brief description of the person.',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: {
        description: 'The job title of the person.',
      },
    },
    {
      name: 'employer',
      type: 'text',
      admin: {
        description: 'The employer of the person.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'A photograph of the person.',
      },
    },
  ],
};

export default Persons;