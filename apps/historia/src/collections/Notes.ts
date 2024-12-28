import type { CollectionConfig } from 'payload';
import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { contentPersons } from '@/fields/contentPersons';
import { image } from '../fields/image';
import { richText } from '@/fields/richText';
import { contentLocations } from '@/fields/contentLocations';
import { slugField } from '@/slug';
import { topics } from '@/fields/topics';
import { title } from '@/fields/title';

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            title,
            {
              type: 'collapsible',
              label: 'Image',
              fields: [
                image
              ],
              admin: {
                initCollapsed: true,
              },
            },
            richText(),
          ]
        }, {
          label: 'Meta',
          fields: [
            topics,
            contentPersons,
            contentLocations,
            ...slugField(),
          ]
        }
      ]
    }
  ],
};

