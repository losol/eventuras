import { Field, Where } from 'payload';

export const relatedContent: Field = {
  name: 'relatedContent',
  type: 'relationship',
  relationTo: ['articles', 'notes', 'pages', 'projects'],
  hasMany: true,
  filterOptions: ({ id, relationTo }) => {
    // Prevent self-referencing if needed
    if (relationTo === 'articles' || relationTo === 'pages' || relationTo === 'notes' || relationTo === 'projects') {
      return {
        id: {
          not_in: [id],
        },
      } as Where;
    }
    return true;
  },
};
