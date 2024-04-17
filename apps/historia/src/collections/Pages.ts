import type { CollectionConfig } from 'payload/types';

import { admins, publishedOnly } from '../access';
import { richText } from '../fields/richText';
import { slug } from '../fields/slug';
import { creators } from '../fields/creators';
import { license } from '../fields/license';
import { story } from '../fields/story';
import { publishedOn } from '../fields/publishedOn';
import { image } from '../fields/image';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
  access: {
    create: admins,
    read: publishedOnly,
    readVersions: admins,
    update: admins,
    delete: admins,
  },
  hooks: {},
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    image,
    richText({
      name: 'lead',
      required: false,
    }),
    story,
    slug(),
    creators,
    license,
    publishedOn,
    {
      name: 'relatedPages',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        };
      },
    },
  ],
};
