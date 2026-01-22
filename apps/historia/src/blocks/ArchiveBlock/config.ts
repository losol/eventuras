import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro',
    },
    {
      name: 'relationTo',
      type: 'select',
      defaultValue: 'articles',
      label: 'Collections To Show',
      options: [
        {
          label: 'Articles',
          value: 'articles',
        },
        {
          label: 'Happenings',
          value: 'happenings',
        },
        {
          label: 'Notes',
          value: 'notes',
        },
        {
          label: 'Cases',
          value: 'cases',
        }
      ],
    },
    {
      name: 'topics',
      type: 'relationship',
      hasMany: true,
      required: false,
      label: 'Topics to show',
      relationTo: 'topics',
    },
    {
      name: 'showImages',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Images',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
         step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
