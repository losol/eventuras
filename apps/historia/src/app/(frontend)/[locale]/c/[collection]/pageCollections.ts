import { Config } from '@/payload-types';

export const pageCollections = ['articles', 'happenings', 'notes', 'organizations', 'persons', 'projects'] as const;
export type ValidCollection = typeof pageCollections[number];
type Collections = Config['collections'];
export type PageCollectionsType = Extract<keyof Collections, ValidCollection>;

export type PaginatedDocs<T extends PageCollectionsType> = {
  docs: Collections[T][];
  page: number;
  totalPages: number;
  totalDocs: number;
};

export const collectionTranslations: Record<string, Record<string, string>> = {
  en: {
    articles: 'articles',
    happenings: 'happenings',
    notes: 'notes',
    organizations: 'organizations',
    persons: 'people',
    projects: 'projects',
  },
  no: {
    articles: 'artikler',
    happenings: 'arrangement',
    notes: 'notiser',
    organizations: 'organisasjoner',
    persons: 'folk',
    projects: 'prosjekter',
  },
};

export const getLocalizedCollectionName = (collection: string, locale: string): string => {
  const translations = collectionTranslations[locale] || collectionTranslations['en'];
  return translations[collection] ?? collection;
};

export const getOriginalCollectionName = (localizedCollection: string, locale: string): string => {
  const translations = collectionTranslations[locale];
  return Object.keys(translations).find(
    (key) => translations[key] === localizedCollection
  ) ?? localizedCollection;
};

/**
 * Generates a localized URL for a given collection, resourceId, and slug.
 * @param locale - The locale (e.g., 'en', 'no').
 * @param collection - The original collection name (e.g., 'articles').
 * @param resourceId - The unique resource ID of the document.
 * @param slug - The slug of the document.
 * @returns A string representing the localized URL.
 */
export const getDocUrl = ({
  locale,
  collection,
  resourceId,
  slug,
}: {
  locale: string;
  collection: string;
  resourceId: string;
  slug: string;
}): string => {
  // Get the localized collection name based on the locale
  const localizedCollectionName = getLocalizedCollectionName(collection, locale);

  // Construct the URL
  return `/${locale}/${localizedCollectionName}/${resourceId}/${slug}`;
};
