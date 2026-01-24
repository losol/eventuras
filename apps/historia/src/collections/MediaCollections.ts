import type { CollectionConfig } from 'payload';

import { admins } from '@/access/admins';
import { anyone } from '@/access/anyone';
import { slugField } from '@/fields/slug';

export const MediaCollections: CollectionConfig = {
  slug: 'media-collections',
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parentCollection', 'updatedAt'],
    group: 'Media',
    description: 'Organize media assets into collections with optional hierarchy',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'e.g., "Product Photos", "Marketing Assets", "Event 2025"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'What this collection is for',
      },
    },
    ...slugField("name"),
    {
      name: 'parentCollection',
      type: 'relationship',
      relationTo: 'media-collections',
      admin: {
        description: 'Optional nesting: "Marketing > Social Media > 2025"',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        // Only check when updating or creating with parent
        if (!data?.parentCollection) return data;

        // Prevent self-reference
        if (originalDoc?.id && data.parentCollection === originalDoc.id) {
          throw new Error('A collection cannot be its own parent');
        }

        // Prevent circular references in chain
        const checkCircular = async (
          parentId: string,
          visitedIds = new Set<string>([originalDoc?.id]),
        ): Promise<boolean> => {
          // If we've seen this ID before, we have a cycle
          if (visitedIds.has(parentId)) return true;
          visitedIds.add(parentId);

          try {
            const parent = await req.payload.findByID({
              collection: 'media-collections',
              id: parentId,
              depth: 0, // Don't need deep data
            });

            // No parent = end of chain, no cycle
            if (!parent?.parentCollection) return false;

            // Check parent's parent recursively
            return checkCircular(
              typeof parent.parentCollection === 'string'
                ? parent.parentCollection
                : parent.parentCollection.id,
              visitedIds,
            );
          } catch (error) {
            // Parent not found = broken reference but not circular
            return false;
          }
        };

        const hasCircular = await checkCircular(
          typeof data.parentCollection === 'string'
            ? data.parentCollection
            : data.parentCollection.id,
        );

        if (hasCircular) {
          throw new Error(
            'Cannot create circular parent-child relationship. ' +
              'This collection is already an ancestor of the selected parent.',
          );
        }

        return data;
      },
    ],
  },
};
