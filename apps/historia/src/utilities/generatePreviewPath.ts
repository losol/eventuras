import { CollectionSlug, PayloadRequest } from 'payload'

import { getLocalizedCollectionName } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  articles: 'c',
  notes: 'c',
  products: 'c',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  resourceId?: string
  breadcrumbsUrl?: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, resourceId, breadcrumbsUrl, req }: Props) => {
  const locale = req.locale || process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'no';
  const prefix = collectionPrefixMap[collection];

  // Build full slug with resourceId if available
  const fullSlug = resourceId ? `${slug}--${resourceId}` : slug;

  let path: string;
  if (prefix === 'c') {
    // Use localized collection name for /c/ routes
    const localizedCollection = getLocalizedCollectionName(collection, locale);
    path = `/${locale}/c/${localizedCollection}/${fullSlug}`;
  } else if (collection === 'pages' && breadcrumbsUrl) {
    // Use breadcrumbs URL for nested pages
    path = `/${locale}${breadcrumbsUrl}`;
  } else {
    path = prefix ? `/${locale}${prefix}/${fullSlug}` : `/${locale}/${fullSlug}`;
  }

  const params = {
    slug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
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
