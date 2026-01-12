import React from 'react';

/**
 * Converts heading text to a URL-safe ID for anchor links
 *
 * @param text - The text to convert to an ID
 * @returns A URL-safe ID string
 *
 * @example
 * ```ts
 * textToId("Hello World!") // "hello-world"
 * textToId("TypeScript & React") // "typescript-react"
 * ```
 */
export function textToId(text: string | string[]): string {
  const textString = Array.isArray(text) ? text.join('') : text;

  return textString
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extracts text content from React children
 * Useful for generating IDs from heading elements
 *
 * @param children - React children to extract text from
 * @returns Extracted text as string
 */
export function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }

  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextFromChildren(props.children);
    }
  }

  return '';
}

/**
 * Type guard to check if a value is a valid internal link relation
 */
export function isValidRelation(value: unknown): value is { slug: string } {
  return value && typeof value === 'object' && 'slug' in value;
}
