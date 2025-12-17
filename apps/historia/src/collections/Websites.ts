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
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Censor User data in contactPoints - only expose name fields
        if (doc.contactPoints) {
          doc.contactPoints = doc.contactPoints.map((cp: { person?: unknown }) => {
            if (cp.person && typeof cp.person === 'object') {
              // Keep only id and name fields
              return {
                ...cp,
                person: {
                  id: (cp.person as Record<string, unknown>).id,
                  given_name: (cp.person as Record<string, unknown>).given_name,
                  middle_name: (cp.person as Record<string, unknown>).middle_name,
                  family_name: (cp.person as Record<string, unknown>).family_name,
                  email: (cp.person as Record<string, unknown>).email,
                },
              };
            }
            return cp;
          });
        }
        return doc;
      },
    ],
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
      name: 'contactPoints',
      label: 'Contact Points',
      type: 'array',
      admin: {
        description: 'Contact points for this website. Only name fields will be publicly visible.',
      },
      fields: [
        {
          name: 'user',
          label: 'User',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            description: 'User responsible for this contact point. Only their name will be visible publicly.',
          },
        },
        {
          name: 'contactType',
          label: 'Contact Type',
          type: 'select',
          required: true,
          options: [
            { label: 'Editor', value: 'editor' },
            { label: 'Sales', value: 'sales' },
            { label: 'Support', value: 'support' },
          ],
        },
      ],
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

