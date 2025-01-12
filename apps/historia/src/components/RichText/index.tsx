import React from 'react';
import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks,
} from '@payloadcms/richtext-lexical/react';

// import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component';
// import { BannerBlock, BannerBlockProps } from '@/blocks/Banner/Component';
// import { CallToActionBlock, CallToActionBlockProps } from '@/blocks/CallToAction/Component';
// import { MediaBlock, MediaBlockProps } from '@/blocks/MediaBlock/Component';
import { cn } from '@/utilities/cn';


type NodeTypes =
  | DefaultNodeTypes
  // | SerializedBlockNode<CodeBlockProps>
  // | SerializedBlockNode<BannerBlockProps>
  // | SerializedBlockNode<MediaBlockProps>
  // | SerializedBlockNode<CallToActionBlockProps>;

  const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    // banner: ({ node }: { node: SerializedBlockNode<BannerBlockProps> }) => (
    //   <BannerBlock className="col-start-2 mb-4" {...node.fields} />
    // ),
    // cta: ({ node }: { node: SerializedBlockNode<CallToActionBlockProps> }) => (
    //   <CallToActionBlock {...node.fields} />
    // ),
    // mediaBlock: ({ node }: { node: SerializedBlockNode<MediaBlockProps> }) => (
    //   <MediaBlock
    //     className="col-start-1 col-span-3"
    //     imgClassName="m-0"
    //     {...node.fields}
    //     captionClassName="mx-auto max-w-[48rem]"
    //     enableGutter={false}
    //     disableInnerContainer={true}
    //   />
    // ),
    // code: ({ node }: { node: SerializedBlockNode<CodeBlockProps> }) => (
    //   <CodeBlock className="col-start-2" {...node.fields} />
    // ),
  },
});

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const { className, enableProse = false, enableGutter = false, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      className={cn(
        {
          'container ': enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert ': enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
}
