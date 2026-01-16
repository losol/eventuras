/**
 * SEO Utilities - Generic helpers for metadata generation
 *
 * Framework-agnostic utilities for working with SEO metadata.
 * Can be moved to libs/ for reuse across projects when mature.
 */

import type { Media } from '@/payload-types';

/**
 * Extracts the optimal image URL from a Media object
 *
 * Priority:
 * 1. socialShare format (1200×630px) - optimal for Open Graph
 * 2. landscape format (1920×1080px) - fallback desktop format
 * 3. Original image URL - final fallback
 *
 * @param image - Media object or ID
 * @param baseUrl - Base URL to prepend (optional)
 * @returns Object with url, width, and height or null
 */
export function getImageURL(
  image: Media | string | null | undefined,
  baseUrl?: string
): { url: string; width: number; height: number } | null {
  if (!image || typeof image === 'string') {
    return null;
  }

  /**
   * Converts relative URLs to absolute URLs
   */
  const toAbsoluteUrl = (url: string): string => {
    // If already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If relative and baseUrl provided, concatenate
    if (baseUrl) {
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${base}${path}`;
    }

    // Return relative URL as-is if no baseUrl
    return url;
  };

  // Try socialShare first (1200×630)
  if (image.sizes?.socialShare?.url) {
    return {
      url: toAbsoluteUrl(image.sizes.socialShare.url),
      width: image.sizes.socialShare.width ?? 1200,
      height: image.sizes.socialShare.height ?? 630,
    };
  }

  // Fallback to landscape (1920×1080)
  if (image.sizes?.landscape?.url) {
    return {
      url: toAbsoluteUrl(image.sizes.landscape.url),
      width: image.sizes.landscape.width ?? 1920,
      height: image.sizes.landscape.height ?? 1080,
    };
  }

  // Final fallback to original
  if (image.url) {
    return {
      url: toAbsoluteUrl(image.url),
      width: image.width ?? 1200,
      height: image.height ?? 630,
    };
  }

  return null;
}

/**
 * Type guard to check if an image is a Media object
 */
export function isMediaObject(image: unknown): image is Media {
  return (
    typeof image === 'object' &&
    image !== null &&
    'url' in image &&
    typeof (image as Media).url === 'string'
  );
}

/**
 * Extracts image from various possible field locations
 *
 * @param doc - Document with potential image fields
 * @returns Media object or null
 */
export function extractImage(doc: {
  meta?: { image?: string | Media | null };
  image?: string | Media | { media?: string | Media | null } | null;
  featuredImage?: string | Media | null;
}): Media | null {
  // Check meta.image first
  if (doc.meta?.image && isMediaObject(doc.meta.image)) {
    return doc.meta.image;
  }

  // Check doc.image (might be nested in {media: ...} object)
  if (doc.image) {
    if (isMediaObject(doc.image)) {
      return doc.image;
    }
    if (
      typeof doc.image === 'object' &&
      'media' in doc.image &&
      isMediaObject(doc.image.media)
    ) {
      return doc.image.media;
    }
  }

  // Check featuredImage
  if (doc.featuredImage && isMediaObject(doc.featuredImage)) {
    return doc.featuredImage;
  }

  return null;
}
