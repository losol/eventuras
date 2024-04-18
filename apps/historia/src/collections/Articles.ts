import type { CollectionConfig } from 'payload/types';

import { admins, publishedOnly } from '../access';
import { richText } from '../fields/richText';
import { slug } from '../fields/slug';
import { creators } from '../fields/creators';
import { contentPersons } from '../fields/contentPersons';
import { license } from '../fields/license';
import { story } from '../fields/story';
import { publishedOn } from '../fields/publishedOn';
import { contentLocations } from '../fields/contentLocations';
import { featuredImage } from '../fields/featuredImage';

export const Articles: CollectionConfig = {
  slug: 'articles',
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
    featuredImage,
    richText({
      name: 'lead',
      required: false,
    }),
    story,
    slug(),
    creators,
    contentPersons,
    contentLocations,
    license,
    publishedOn,
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
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
