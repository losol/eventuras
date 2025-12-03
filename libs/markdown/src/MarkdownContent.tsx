import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui/core/Link';
import { List } from '@eventuras/ratio-ui/core/List';
import { normalizeMarkdown } from './normalizeMarkdown';

export type MarkdownContentProps = {
  markdown?: string | null;
  heading?: string;
  /** Keep invisible/control characters instead of stripping them. Default: false */
  keepInvisibleCharacters?: boolean;
  /** Allow raw HTML in markdown (unsafe). Default: false */
  enableRawHtml?: boolean;
  /** Allow external/absolute URLs in links and images. Default: false (only relative URLs allowed) */
  allowExternalLinks?: boolean;
  /** Strip HTML tags from input before processing. Useful for legacy content with HTML-wrapped markdown. Default: false */
  stripHtmlTags?: boolean;
};

export const MarkdownContent = ({
  markdown,
  heading,
  keepInvisibleCharacters = false,
  enableRawHtml = false,
  allowExternalLinks = false,
  stripHtmlTags = false,
}: MarkdownContentProps) => {
  if (!markdown) return null;

  // Strip HTML tags if requested (useful for legacy content with HTML-wrapped markdown)
  let processedMarkdown = markdown;
  if (stripHtmlTags) {
    processedMarkdown = markdown.replace(/<[^>]*>/g, '');
  }

  const source = keepInvisibleCharacters ? processedMarkdown : normalizeMarkdown(processedMarkdown);

  // rehype-sanitize with defaultSchema (GitHub-style sanitization) handles:
  // - Blocking javascript:, data:, and other dangerous URL protocols
  // - Stripping script tags and dangerous attributes (onclick, onerror, etc.)
  // - Allowing standard HTML tags including strong, em, etc.
  //
  // We only need to add external link filtering in component overrides when allowExternalLinks=false

  // Helper to check if a URL points to an external origin
  const isExternalUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url, 'https://dummy.local');
      return parsed.host !== 'dummy.local';
    } catch {
      return false;
    }
  };

  // Create rehype plugins list
  const rehypePlugins: any[] = [
    ...(enableRawHtml ? [rehypeRaw] : []),
    [rehypeSanitize, defaultSchema],
  ];

  // Component overrides for custom rendering
  const components: Components = {
    a: ({ node, href, children, ...props }) => {
      // Block external links if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(href)) {
        return <span>{children}</span>;
      }
      return (
        <Link
          href={href || ''}
          componentProps={{
            rel: 'noopener noreferrer',
            target: '_blank',
          }}
          {...props}
        >
          {children}
        </Link>
      );
    },
    img: ({ node, src, alt, ...props }) => {
      // Block external images if not allowed (rehype-sanitize already handles dangerous protocols)
      if (!allowExternalLinks && isExternalUrl(src)) {
        return null;
      }
      return (
        <img
          src={src}
          alt={alt}
          {...props}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      );
    },
    p: ({ node, ...props }) => <Text as="p" className="pb-3" {...props} />,
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
      <List as="ul" variant="markdown" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <List as="ol" variant="markdown" {...props} />
    ),
    li: ({ node, ...props }) => <List.Item {...props} />,
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
