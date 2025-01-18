import React from 'react';
import { Card } from '@/components/Card';
import type { Article, Happening, Page, Person, Organization, Project, Note } from '@/payload-types';

export type ArchiveDocument = Article | Happening | Page | Project | Note;

type CollectionArchiveProps<T extends { slug: string }> = {
  docs: ArchiveDocument[];
  relationTo: 'articles' | 'happenings' | 'notes' | 'projects';
  showImages?: boolean;
};

export const CollectionArchive = <T extends { slug: string }>({ docs, relationTo, showImages = true }: CollectionArchiveProps<T>) => {
  return (
    <div>
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {docs?.map((doc) => (
            <div className="col-span-4" key={doc.resourceId}>
              <Card className="h-full" doc={doc} relationTo={relationTo} showImages={showImages} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
