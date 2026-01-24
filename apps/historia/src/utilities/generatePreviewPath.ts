import { CollectionSlug, PayloadRequest } from 'payload'

import { getLocalizedCollectionName } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  articles: 'c',
  notes: 'c',
  products: 'c',
  timelines: 'c',
  pages: '',
  quotes: 'i',
  sources: 'i',
  terms: 't',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug?: string
  resourceId?: string
  breadcrumbsUrl?: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, resourceId, breadcrumbsUrl, req }: Props) => {
  const locale = req.locale || process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no';
  const prefix = collectionPrefixMap[collection];

  let path: string;

  // Handle resourceId-only routes (quotes, sources, terms)
  if ((prefix === 'i' || prefix === 't') && resourceId) {
    if (prefix === 't') {
      // Terms use /t/[resourceId] pattern
      path = `/${locale}/t/${resourceId}`;
    } else {
      // Map collection to URL name (quote/source vs quotes/sources)
      const urlCollection = collection === 'quotes' ? (locale === 'no' ? 'sitat' : 'quote') : (locale === 'no' ? 'kilde' : 'source');
      path = `/${locale}/i/${urlCollection}/${resourceId}`;
    }
  } else if (prefix === 'c' && slug) {
    // Use localized collection name for /c/ routes
    const localizedCollection = getLocalizedCollectionName(collection, locale);
    // Build full slug with resourceId if available
    const fullSlug = resourceId ? `${slug}--${resourceId}` : slug;
    path = `/${locale}/c/${localizedCollection}/${fullSlug}`;
  } else if (collection === 'pages' && breadcrumbsUrl) {
    // Use breadcrumbs URL for nested pages
    path = `/${locale}${breadcrumbsUrl}`;
  } else if (slug) {
    // Build full slug with resourceId if available
    const fullSlug = resourceId ? `${slug}--${resourceId}` : slug;
    path = prefix ? `/${locale}${prefix}/${fullSlug}` : `/${locale}/${fullSlug}`;
  } else {
    // Fallback for missing slug/resourceId
    path = `/${locale}`;
  }

  const params: Record<string, string> = {
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  }

  // Only add slug if it exists (not required for resourceId-only routes)
  if (slug) {
    params.slug = slug;
  }

  const encodedParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    encodedParams.append(key, value)
  })

  const isProduction =
    process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  const protocol = isProduction ? 'https:' : req.protocol

  const url = `${protocol}//${req.host}/next/preview?${encodedParams.toString()}`

  return url
}
