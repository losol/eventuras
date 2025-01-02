import { Field } from 'payload';

export const contributors: Field = {
  name: 'contributors',
  label: 'Contributors',
  interfaceName: 'Contributor',
  type: 'array',
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Author', value: 'author' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Illustrator', value: 'illustrator' },
        { label: 'Photographer', value: 'photographer' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      defaultValue: 'author'
    }
  ]
};
