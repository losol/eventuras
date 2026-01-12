import React from 'react';

import { Story } from '@eventuras/ratio-ui/blocks/Story';

import RichText from '@/components/RichText';
import type { ContentBlock as ContentBlockProps } from '@/payload-types';

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  if (!props?.richText) return null;

  return (
    <Story>
      <RichText data={props.richText} enableProse={false} />
    </Story>
  );
};
