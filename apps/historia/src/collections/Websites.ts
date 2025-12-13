import type { CollectionConfig } from 'payload';

import { Nav } from '@/blocks/Nav/config';
import { meta } from '@/fields/meta';
import { name } from '@/fields/name';
import { summary } from '@/fields/summary';
import { title } from '@/fields/title';

import { admins } from '../access/admins';
import { anyone } from '../access/anyone';
import { authenticatedOrFirstWebsite } from '../access/authenticatedOrFirstWebsite';

export const Websites: CollectionConfig = {
  slug: 'websites',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: authenticatedOrFirstWebsite,
    update: admins,
    delete: admins,
  },
  fields: [
    name,
    title,
    summary,
    {
      name: 'domains',
      label: 'Domains',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'homePage',
      label: 'Home Page',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
    },
    {
      name: 'publisher',
      label: 'Publisher',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      admin: {
        description: 'The organization that publishes this website',
      },
    },
    {
      name: 'siteSettings',
      label: 'Site Settings',
      type: 'group',
      fields: [
        {
          name: 'footer',
          label: 'Footer',
          type: 'group',
          fields: [
            {
              name: 'navigation',
              label: 'Footer Navigation',
              type: 'blocks',
              blocks: [Nav],
              admin: {
                description: 'Navigation for the footer',
              },
            },
          ],
        },
      ],
    },
    meta,
  ],
};

