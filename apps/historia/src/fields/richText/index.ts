// Based on https://github.com/payloadcms/public-demo/blob/master/src/payload/fields/richText/index.ts
import type { FeatureProvider } from '@payloadcms/richtext-lexical';
import type { RichTextField } from 'payload/types';

import { ParagraphFeature, UploadFeature, lexicalEditor } from '@payloadcms/richtext-lexical';

import { deepMerge } from '../../utilities/deepMerge';
import { editorFeatures } from './editorFeatures';

type RichText = (
  overrides?: Partial<RichTextField>,
  additions?: {
    features?: FeatureProvider[];
  },
) => RichTextField;

const richText: RichText = (
  overrides,
  additions = {
    features: [],
  },
) =>
  deepMerge<RichTextField>(
    {
      name: 'richText',
      editor: lexicalEditor({
        features: () => [
          ...[...editorFeatures, ...(additions.features || [])],
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'caption',
                    editor: lexicalEditor({
                      features: () => [ParagraphFeature(), ...editorFeatures],
                    }),
                    label: 'Caption',
                    type: 'richText',
                  },
                  {
                    name: 'alignment',
                    label: 'Alignment',
                    options: [
                      {
                        label: 'Left',
                        value: 'left',
                      },
                      {
                        label: 'Center',
                        value: 'center',
                      },
                      {
                        label: 'Right',
                        value: 'right',
                      },
                    ],
                    type: 'radio',
                  },
                ],
              },
            },
          }),
        ],
      }),
      required: true,
      type: 'richText',
    },
    overrides || {},
  );

export default richText;
