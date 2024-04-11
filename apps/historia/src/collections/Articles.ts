import type { CollectionConfig } from 'payload/types';

import { admins, publishedOnly } from '../access';
import { richText } from '../fields/richText';
import { slug } from '../fields/slug';
import { Content } from '../blocks/content';
import { Image } from '../blocks/image';
import { creators } from '../fields/creators';
import { contentPeople } from '../fields/contentPeople';
import { license } from '../fields/license';

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
    richText({
      name: 'lead',
      required: false,
    }),
    {
      name: 'featuredMedia',
      type: 'blocks',
      blocks: [Image],
      minRows: 0,
      maxRows: 1,
    },
    {
      name: 'content',
      type: 'blocks',
      // blocks: [Banner, BlogContent, Code, BlogMarkdown, MediaBlock, ReusableContent],
      blocks: [Content],
      required: true,
    },
    slug(),
    creators,
    contentPeople,
    license,
    {
      name: 'publishedOn',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
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
