import type React from 'react';
import Markdown from 'markdown-to-jsx';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { sanitizeMarkdown } from './sanitizeMarkdown';
import { SafeLink, SafeImg } from './SafePrimitives';

export type MarkdownContentProps = {
  markdown?: string | null;
  heading?: string;
  /** Keep invisible/control characters instead of stripping them. Default: false */
  keepInvisibleCharacters?: boolean;
  /** Allow raw HTML in markdown (unsafe). Default: false */
  enableRawHtml?: boolean;
};

export const MarkdownContent = ({
  markdown,
  heading,
  keepInvisibleCharacters = false,
  enableRawHtml = false,
}: MarkdownContentProps) => {
  if (!markdown) return null;

  const source = keepInvisibleCharacters ? markdown : sanitizeMarkdown(markdown);

  const options = {
    // only parse HTML when enabled
    disableParsingRawHTML: !enableRawHtml,
    overrides: {
      a: { component: SafeLink as React.FC },
      img: { component: SafeImg as React.FC },
      p: {
        component: Text as React.FC,
        props: { as: 'p', className: 'pb-3' },
      },
      h1: {
        component: Heading as React.FC,
        props: { as: 'h1' },
      },
      h2: {
        component: Heading as React.FC,
        props: { as: 'h2' },
      },
      h3: {
        component: Heading as React.FC,
        props: { as: 'h3' },
      },
      h4: {
        component: Heading as React.FC,
        props: { as: 'h4' },
      },
      h5: {
        component: Heading as React.FC,
        props: { as: 'h5' },
      },
      h6: {
        component: Heading as React.FC,
        props: { as: 'h6' },
      },
      ul: {
        props: { className: 'list-disc list-inside pb-3 space-y-1' },
      },
      ol: {
        props: { className: 'list-decimal list-inside pb-3 space-y-1' },
      },
      li: {
        props: { className: 'ml-4' },
      },
      blockquote: {
        props: { className: 'border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700' },
      },
      code: {
        props: { className: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono' },
      },
      pre: {
        props: { className: 'bg-gray-100 p-4 rounded overflow-x-auto my-4' },
      },
      hr: {
        props: { className: 'my-8 border-gray-300' },
      },
      strong: {
        props: { className: 'font-bold' },
      },
      em: {
        props: { className: 'italic' },
      },
    },
  } as const;

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      <Markdown options={options}>{source}</Markdown>
    </>
  );
};
