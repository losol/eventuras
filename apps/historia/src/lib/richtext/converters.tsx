import React from 'react';
import type { SerializedLinkNode } from '@payloadcms/richtext-lexical';
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical';
import type { JSXConverters } from '@payloadcms/richtext-lexical/react';

import { extractTextFromChildren, textToId } from '@eventuras/ratio-ui/blocks/Story';

/**
 * Converts internal Payload document links to proper href paths
 *
 * @example
 * ```tsx
 * // In your jsxConverters:
 * ...LinkJSXConverter({ internalDocToHref })
 * ```
 */
export const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const { value, relationTo } = linkNode.fields.doc!;

  const slug = typeof value !== 'string' && value?.slug;

  // Add your collection routing logic here
  if (relationTo === 'pages') {
    return `/${slug}`;
  } else if (relationTo === 'posts') {
    return `/posts/${slug}`;
  } else if (relationTo === 'products') {
    return `/products/${slug}`;
  }

  return `/${slug}`;
};

/**
 * Custom heading converter that adds anchor IDs to headings
 * Enables linking directly to sections via #heading-id
 *
 * @example
 * ```tsx
 * // In your jsxConverters:
 * const jsxConverter: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
 *   ...defaultConverters,
 *   ...headingConverter,
 * })
 * ```
 */
export const headingConverter: JSXConverters<SerializedHeadingNode> = {
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    const children = nodesToJSX({ nodes: node.children });

    // Generate ID from heading text for anchor links
    // Note: Duplicate heading texts will result in duplicate IDs.
    // For unique IDs across the page, consider maintaining a counter or using a library.
    if (node.tag === 'h2' || node.tag === 'h3') {
      const textContent = extractTextFromChildren(children);
      const id = textToId(textContent);

      return <Tag id={id}>{children}</Tag>;
    }

    return <Tag>{children}</Tag>;
  },
};
