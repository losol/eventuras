import { Field } from 'payload/types';

export const creators: Field = {
  name: 'creators',
  label: 'Creators',
  type: 'array',
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'people',
      required: true
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Artificial Intelligence', value: 'ai' },
        { label: 'Author', value: 'author' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Illustrator', value: 'illustrator' },
        { label: 'Photographer', value: 'photographer' },
      ],
      required: true,
      defaultValue: 'author'
    }
  ]
};
