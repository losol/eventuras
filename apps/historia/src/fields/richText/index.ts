import type { FeatureProviderServer } from '@payloadcms/richtext-lexical';
import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  ParagraphFeature,
} from '@payloadcms/richtext-lexical';
import type { RichTextField } from 'payload';

type RichText = (
  overrides?: Partial<RichTextField>,
  additionalFeatures?: FeatureProviderServer[],
) => RichTextField;

export const richText: RichText = (
  overrides = {},
  additionalFeatures = [],
): RichTextField => {
  const defaultFeatures = [
    InlineToolbarFeature(),
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['articles', 'cases', 'pages', 'notes'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false;
          return true;
        });

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: ({ linkType }) => linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
          },
        ];
      },
    }),
    ...additionalFeatures,
  ];

  return {
    name: 'richText',
    type: 'richText',
    required: false,
    ...overrides,
    editor: lexicalEditor({
      features: () => defaultFeatures,
    }),
  };
};

