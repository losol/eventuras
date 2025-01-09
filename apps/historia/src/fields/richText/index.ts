import type { FeatureProviderServer } from '@payloadcms/richtext-lexical';
import type { RichTextField } from 'payload';

type RichText = (
  overrides?: Partial<RichTextField>,
  additionalFeatures?: FeatureProviderServer[],
) => RichTextField;

export const richText: RichText = (overrides = {}): RichTextField => {
  return {
    name: 'richText',
    type: 'richText',
    required: false,
    ...overrides,
  };
};

