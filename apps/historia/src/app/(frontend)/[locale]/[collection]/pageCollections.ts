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
