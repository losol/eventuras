import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
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
  /** Allow external/absolute URLs in links and images. Default: false (only relative URLs allowed) */
  allowExternalLinks?: boolean;
};

export const MarkdownContent = ({
  markdown,
  heading,
  keepInvisibleCharacters = false,
  enableRawHtml = false,
  allowExternalLinks = false,
}: MarkdownContentProps) => {
  if (!markdown) return null;

  const source = keepInvisibleCharacters ? markdown : sanitizeMarkdown(markdown);

  // Configure rehype-sanitize schema
  const sanitizeSchema = {
    ...defaultSchema,
    protocols: {
      ...defaultSchema.protocols,
      // Only allow http/https and relative URLs, block javascript:, data:, etc.
      href: allowExternalLinks ? ['http', 'https'] : [],
      src: allowExternalLinks ? ['http', 'https'] : [],
    },
  };

  // Create rehype plugins list
  const rehypePlugins: any[] = [
    ...(enableRawHtml ? [rehypeRaw] : []),
    [rehypeSanitize, sanitizeSchema],
  ];

  // Component overrides for custom rendering
  const components: Components = {
    a: ({ node, ...props }) => (
      <SafeLink allowExternalLinks={allowExternalLinks} {...props} />
    ),
    img: ({ node, ...props }) => (
      <SafeImg allowExternalLinks={allowExternalLinks} {...props} />
    ),
    p: ({ node, ...props }) => (
      <Text as="p" className="pb-3" {...props} />
    ),
    h1: ({ node, children, ...props }) => (
      <Heading as="h1" {...props}>
        {children}
      </Heading>
    ),
    h2: ({ node, children, ...props }) => (
      <Heading as="h2" {...props}>
        {children}
      </Heading>
    ),
    h3: ({ node, children, ...props }) => (
      <Heading as="h3" {...props}>
        {children}
      </Heading>
    ),
    h4: ({ node, children, ...props }) => (
      <Heading as="h4" {...props}>
        {children}
      </Heading>
    ),
    h5: ({ node, children, ...props }) => (
      <Heading as="h5" {...props}>
        {children}
      </Heading>
    ),
    h6: ({ node, children, ...props }) => (
      <Heading as="h6" {...props}>
        {children}
      </Heading>
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside pb-3 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside pb-3 space-y-1" {...props} />
    ),
    li: ({ node, ...props }) => <li className="ml-4" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700"
        {...props}
      />
    ),
    code: ({ node, className, children, ...props }) => {
      // Check if it's inline code (no className with "language-" prefix)
      const isInline = !className || !className.startsWith('language-');
      return isInline ? (
        <code
          className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ node, ...props }) => (
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-4" {...props} />
    ),
    hr: ({ node, ...props }) => <hr className="my-8 border-gray-300" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
    em: ({ node, ...props }) => <em className="italic" {...props} />,
  };

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </>
  );
};
