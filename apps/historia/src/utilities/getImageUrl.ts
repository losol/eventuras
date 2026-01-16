import type { Image, Media } from '@/payload-types';

/**
 * Size preference for image URL retrieval
 */
export type ImageSize = 'thumbnail' | 'square' | 'landscape' | 'socialShare' | 'verticalStory' | 'banner' | 'original';

/**
 * Extract the best available image URL from a Payload CMS image object.
 *
 * @param image - The image object from Payload CMS
 * @param preferredSize - The preferred image size ('thumbnail', 'landscape', or 'original')
 * @returns The image URL or null if not available
 *
 * @example
 * ```tsx
 * const imageUrl = getImageUrl(product.image, 'landscape');
 * if (imageUrl) {
 *   <img src={imageUrl} alt="Product" />
 * }
 * ```
 */
export function getImageUrl(
  image: Image | null | undefined,
  preferredSize: ImageSize = 'landscape',
): string | null {
  if (!image || typeof image !== 'object') {
    return null;
  }

  if (!('media' in image) || !image.media || typeof image.media !== 'object') {
    return null;
  }

  const media = image.media as Media;

  const normalizeUrl = (candidate: string): string => {
    // If Payload returns an absolute URL for the current site (same origin),
    // prefer a relative path so Next.js treats it as a local image.
    // This avoids relying on build-time `images.remotePatterns`.
    if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
      return candidate;
    }

    try {
      const parsed = new URL(candidate);

      if (typeof window !== 'undefined' && window?.location?.hostname) {
        if (parsed.hostname === window.location.hostname) {
          return `${parsed.pathname}${parsed.search}`;
        }
        return candidate;
      }

      const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL;
      if (cmsUrl) {
        const cmsParsed = new URL(cmsUrl);
        if (parsed.hostname === cmsParsed.hostname) {
          return `${parsed.pathname}${parsed.search}`;
        }
      }
    } catch {
      // Ignore parsing errors and keep original
    }

    return candidate;
  };

  // Try to get the preferred size
  if (preferredSize !== 'original' && 'sizes' in media && media.sizes) {
    const sizeUrl = media.sizes[preferredSize]?.url;
    if (sizeUrl) {
      return normalizeUrl(sizeUrl);
    }
  }

  // Fallback to landscape size
  if (preferredSize === 'thumbnail' && 'sizes' in media && media.sizes?.landscape?.url) {
    return normalizeUrl(media.sizes.landscape.url);
  }

  // Fallback to original URL
  if ('url' in media && media.url) {
    return normalizeUrl(media.url);
  }

  return null;
}

/**
 * Get the caption for an image.
 *
 * @param image - The image object from Payload CMS
 * @returns The caption object or null
 *
 * @example
 * ```tsx
 * const caption = getImageCaption(product.image);
 * if (caption) {
 *   <RichText data={caption} />
 * }
 * ```
 */
export function getImageCaption(
  image: Image | null | undefined,
): Image['caption'] | null {
  if (!image || typeof image !== 'object') {
    return null;
  }

  if ('caption' in image && image.caption) {
    return image.caption;
  }

  return null;
}

/**
 * Get the alt text for an image from various sources.
 *
 * @param image - The image object from Payload CMS
 * @param fallback - Fallback text if no alt text is available
 * @returns The alt text or fallback
 *
 * @example
 * ```tsx
 * const alt = getImageAlt(product.image, product.title);
 * ```
 */
export function getImageAlt(
  image: Image | null | undefined,
  fallback: string = '',
): string {
  if (!image || typeof image !== 'object') {
    return fallback;
  }

  const media = 'media' in image && image.media && typeof image.media === 'object'
    ? (image.media as Media)
    : null;

  // Try to get alt text from caption (most specific - per-usage context)
  if ('caption' in image && image.caption) {
    if (typeof image.caption === 'object' && 'root' in image.caption) {
      const captionText = image.caption.root.children
        .map((child: any) => {
          if (typeof child === 'object' && 'text' in child) {
            return child.text;
          }
          return '';
        })
        .join(' ')
        .trim();

      if (captionText) {
        return captionText;
      }
    }
  }

  // Try to get plaintext from media description (general description of the media)
  if (media && 'description' in media && media.description) {
    if (typeof media.description === 'object' && 'root' in media.description) {
      const descriptionText = media.description.root.children
        .map((child: any) => {
          if (typeof child === 'object' && 'text' in child) {
            return child.text;
          }
          return '';
        })
        .join(' ')
        .trim();

      if (descriptionText) {
        return descriptionText;
      }
    }
  }

  return fallback;
}

/**
 * Get comprehensive image properties for rendering.
 *
 * @param image - The image object from Payload CMS
 * @param preferredSize - The preferred image size ('thumbnail', 'landscape', or 'original')
 * @returns Object with url, alt, caption, width, and height
 *
 * @example
 * ```tsx
 * const imageProps = getImageProps(hero.image, 'landscape');
 * if (imageProps.url) {
 *   <Image src={imageProps.url} alt={imageProps.alt} width={imageProps.width} height={imageProps.height} />
 * }
 * ```
 */
export function getImageProps(
  image: Image | null | undefined,
  preferredSize: ImageSize = 'landscape',
) {
  const url = getImageUrl(image, preferredSize);
  const caption = getImageCaption(image);
  const alt = getImageAlt(image);

  let width: number | undefined;
  let height: number | undefined;

  if (image && typeof image === 'object' && 'media' in image && image.media && typeof image.media === 'object') {
    const media = image.media as Media;

    // Get dimensions from preferred size
    if (preferredSize !== 'original' && 'sizes' in media && media.sizes) {
      const size = media.sizes[preferredSize];
      if (size) {
        width = typeof size.width === 'number' ? size.width : undefined;
        height = typeof size.height === 'number' ? size.height : undefined;
      }
    }

    // Fallback to original dimensions
    if (!width && 'width' in media && typeof media.width === 'number') {
      width = media.width;
    }
    if (!height && 'height' in media && typeof media.height === 'number') {
      height = media.height;
    }
  }

  return {
    url,
    alt,
    caption,
    width,
    height,
  };
}
