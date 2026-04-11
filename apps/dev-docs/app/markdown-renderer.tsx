'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown content with GFM support and heading IDs
 * for table-of-contents anchor links.
 */
export function MarkdownRenderer({ content }: Readonly<MarkdownRendererProps>) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
    >
      {content}
    </ReactMarkdown>
  );
}
