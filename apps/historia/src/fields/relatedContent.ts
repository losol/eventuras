
import { Field } from 'payload/types';

export const relatedContent: Field = {
  name: 'relatedContent',
  type: 'relationship',
  relationTo: ['articles', 'notes', 'pages'],
  hasMany: true,
  filterOptions: ({ id, relationTo }) => {
    // Prevent self-referencing if needed
    if (relationTo === 'articles' || relationTo === 'pages' || relationTo === 'notes') {
      return {
        id: {
          not_in: [id],
        },
      };
    }
    return {};
  },
  admin: {
    description: 'Relate to persons, places, articles, notes, and pages.',
  },
};
