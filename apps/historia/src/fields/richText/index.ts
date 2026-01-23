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

/**
 * Creates a configured richText field with inline formatting toolbar.
 *
 * @param overrides - Partial RichTextField properties to override defaults
 * @param additionalFeatures - Additional Lexical editor features to append to the default set
 * @returns A fully configured RichTextField with Bold, Italic, and Link features
 *
 * @example
 * ```ts
 * // Basic usage
 * richText({ name: 'content', localized: true })
 *
 * // With additional features
 * richText(
 *   { name: 'content', required: true },
 *   [UnderlineFeature(), StrikethroughFeature()]
 * )
 * ```
 */
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
    editor: lexicalEditor({
      features: () => defaultFeatures,
    }),
    ...overrides,
  };
};

