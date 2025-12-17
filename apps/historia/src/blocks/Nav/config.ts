import type { Block } from 'payload';

import { url } from '@/fields/url';

export const Nav: Block = {
  slug: 'nav',
  interfaceName: 'NavBlock',
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional heading for this navigation section',
        placeholder: 'e.g., Company, Legal, Resources',
      },
    },
    {
      name: 'items',
      label: 'Navigation Items',
      type: 'blocks',
      blocks: [
        {
          slug: 'internalLink',
          labels: {
            singular: 'Internal Link',
            plural: 'Internal Links',
          },
          fields: [
            {
              name: 'text',
              label: 'Link Text',
              type: 'text',
              required: false,
              admin: {
                description: 'Optional. If empty, uses the page title',
              },
            },
            {
              name: 'page',
              label: 'Page',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
            },
          ],
        },
        {
          slug: 'externalLink',
          labels: {
            singular: 'External Link',
            plural: 'External Links',
          },
          fields: [
            {
              name: 'text',
              label: 'Link Text',
              type: 'text',
              required: true,
            },
            url,
            {
              name: 'openInNewTab',
              label: 'Open in New Tab',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
        {
          slug: 'separator',
          labels: {
            singular: 'Separator',
            plural: 'Separators',
          },
          fields: [
            {
              name: 'style',
              label: 'Separator Style',
              type: 'select',
              defaultValue: 'line',
              options: [
                { label: 'Line', value: 'line' },
                { label: 'Space', value: 'space' },
                { label: 'Dots', value: 'dots' },
              ],
            },
          ],
        },
      ],
      admin: {
        description: 'Add links and separators for navigation',
      },
    },
  ],
};
