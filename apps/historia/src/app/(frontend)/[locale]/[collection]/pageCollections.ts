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
