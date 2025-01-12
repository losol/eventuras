import React from 'react';
import { Card } from '@/components/Card';
import type { Article, Happening, Page, Person, Organization, Project, Note } from '@/payload-types';

type Document = Article | Happening | Page | Person | Organization | Project | Note;

type CollectionArchiveProps<T extends { slug: string }> = {
  docs: Document[];
  relationTo: "articles" | "happenings" | "pages" | "persons" | "organizations" | "projects" | "notes";
};

export const CollectionArchive = <T extends { slug: string }>({ docs, relationTo }: CollectionArchiveProps<T>) => {
  return (
    <div>
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {docs?.map((doc) => (
            <div className="col-span-4" key={doc.slug}>
              <Card className="h-full" doc={doc} relationTo={relationTo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
