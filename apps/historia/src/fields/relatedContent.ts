import { CollectionSlug, Field, Where } from 'payload';

const relatedCollections: CollectionSlug[] = ['articles', 'notes', 'pages', 'persons', 'places', 'cases'];

export const relatedContent: Field = {
  name: 'relatedContent',
  type: 'relationship',
  relationTo: relatedCollections,
  hasMany: true,
  filterOptions: ({ id, relationTo }) => {
    // Prevent self-referencing
    if (relatedCollections.includes(relationTo)) {
      return {
        id: {
          not_in: [id],
        },
      } as Where;
    }
    return true;
  },
};
