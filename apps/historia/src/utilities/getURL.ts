import { getLocalizedCollectionName, getOriginalCollectionName } from '@/app/(frontend)/[locale]/c/[collection]/pageCollections';

import canUseDOM from './canUseDOM';

export const getServerSideURL = () => {
  return process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000';;
};

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${domain}${port ? `:${port}` : ''}`;
  }

  return process.env.NEXT_PUBLIC_CMS_URL || '';
};


export interface ResourceDoc {
  locale: string;
  collection: string;
  resourceId: string;
  slug: string;
}
/**
 * Generates the full URL to the page displaying a resource.
 *
 * @param {object} doc - The document containing `locale`, `collection`, `resourceId`, and `slug`.
 * @param {boolean} absolute - Whether to generate an absolute or relative URL. Defaults to `false` (relative).
 * @returns {string} The URL to the resource page.
 */
export const getResourceUrl = (doc: ResourceDoc, absolute = false) => {
  if (!doc || typeof doc !== 'object') {
    return '';
  }

  const { locale, collection, resourceId, slug } = doc;

  if (!locale || !collection || !resourceId || !slug) {
    return '';
  }

  const originalCollectionName = getOriginalCollectionName(collection, locale);
  const localizedCollectionName = getLocalizedCollectionName(originalCollectionName, locale);

  const basePath = `/${locale}/${localizedCollectionName}/${resourceId}/${slug}`;

  if (absolute) {
    const baseUrl = canUseDOM ? getClientSideURL() : getServerSideURL();
    return `${baseUrl}${basePath}`;
  }

  return basePath;
};
