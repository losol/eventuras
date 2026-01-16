/**
 * Generate Next.js Metadata from Payload CMS documents
 *
 * Smart fallback chain for SEO metadata generation with multi-tenant support.
 */

import type { Metadata } from 'next';

import type { SEODocument } from '@/lib/payload-plugin-seo';
import type { Website } from '@/payload-types';
import { getServerSideURL } from '@/utilities/getURL';

import { extractImage, getImageURL } from './utils';

export interface GenerateMetaOptions {
  /**
   * The document to generate metadata for
   */
  doc: SEODocument;

  /**
   * Optional website for fallback meta values and canonical URL domain
   */
  website?: Website | null;

  /**
   * Optional base URL override (defaults to getServerSideURL())
   */
  baseUrl?: string;
}

/**
 * Generates Next.js Metadata object from a Payload CMS document
 *
 * Implements smart fallback chain:
 * - **Title**: doc.meta.title → doc.title → website.meta.title → "Historia"
 * - **Description**: doc.meta.description → doc.lead/excerpt → website.meta.description
 * - **Image**: doc.meta.image → doc.image/featuredImage → website.meta.image
 *
 * Image URLs automatically use the optimal `socialShare` format (1200×630px) when available.
 *
 * @param options - Configuration options
 * @returns Next.js Metadata object
 *
 * @example
 * ```typescript
 * import { generateMeta } from '@/lib/seo';
 * import { getCurrentWebsite } from '@/lib/website';
 *
 * export async function generateMetadata({ params }) {
 *   const doc = await fetchArticle(params.slug);
 *   const website = await getCurrentWebsite();
 *
 *   return generateMeta({ doc, website });
 * }
 * ```
 */
export async function generateMeta(
  options: GenerateMetaOptions
): Promise<Metadata> {
  const { doc, website, baseUrl } = options;

  const serverUrl = baseUrl || getServerSideURL();

  // Title fallback chain
  const title =
    doc.meta?.title ||
    doc.title ||
    (typeof website?.meta?.title === 'string' ? website.meta.title : null) ||
    'Historia';

  // Description fallback chain
  const description =
    doc.meta?.description ||
    doc.lead ||
    doc.excerpt ||
    (typeof website?.meta?.description === 'string'
      ? website.meta.description
      : null) ||
    undefined;

  // Image fallback chain
  const docImage = extractImage(doc);
  const websiteImage = website?.meta?.image
    ? extractImage({ meta: { image: website.meta.image } })
    : null;

  const image = docImage || websiteImage;
  const imageData = image ? getImageURL(image, serverUrl) : null;

  // Canonical URL - use website's primary domain if available
  let canonicalUrl: string | undefined;
  if (doc.slug && doc.locale) {
    const domain =
      website?.domains && website.domains.length > 0
        ? website.domains[0]
        : new URL(serverUrl).host;

    // Build URL based on collection type
    if (doc.resourceId) {
      // Collection document: /locale/c/collection/slug--resourceId
      const collection = 'collection'; // TODO: Pass collection name or derive from doc
      canonicalUrl = `https://${domain}/${doc.locale}/c/${collection}/${doc.slug}--${doc.resourceId}`;
    } else {
      // Page document: /locale/slug
      canonicalUrl = `https://${domain}/${doc.locale}/${doc.slug}`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description: description || undefined,
      images: imageData ? [{
        url: imageData.url,
        width: imageData.width,
        height: imageData.height,
      }] : undefined,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      images: imageData ? [imageData.url] : undefined,
    },
  };
}
