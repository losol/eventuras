import React from 'react';
import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks,
} from '@payloadcms/richtext-lexical/react';

import { ImageBlock } from '@/blocks/Image/Component';
import type { ImageBlock as ImageBlockProps } from '@/payload-types';
import { cn } from '@/utilities/cn';


type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<ImageBlockProps>;

  const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    image: ({ node }: { node: SerializedBlockNode<ImageBlockProps> }) => (
      <ImageBlock {...node.fields} />
    ),
  },
});

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = false, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          'container ': enableGutter,
          'max-w-none prose-p:my-3': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert prose-p:my-3': enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
}
