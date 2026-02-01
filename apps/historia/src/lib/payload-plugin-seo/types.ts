/**
 * TypeScript types for SEO meta fields
 */

import type { Media } from '@/payload-types';

/**
 * SEO meta fields structure
 */
export interface SEOFields {
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: string | Media | null;
  };
}

/**
 * Configuration options for SEO fields
 */
export interface SEOConfig {
  /**
   * Locale for tab labels
   */
  locale?: 'en' | 'no';
}

/**
 * Image field structure used by Payload (with media and caption)
 */
export interface ImageField {
  media?: string | Media | null;
  caption?: unknown;
}

/**
 * Document with SEO fields and common content fields
 */
export interface SEODocument extends SEOFields {
  title?: string | null;
  slug?: string | null;
  resourceId?: string | null;
  locale?: string | null;
  image?: string | Media | ImageField | null;
  featuredImage?: string | Media | null;
  lead?: string | null;
  excerpt?: string | null;
}
