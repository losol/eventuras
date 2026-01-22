import React from 'react';

import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import { Card } from '@/components/Card';
import type { Article, Case,Happening, Note, Organization, Page, Person } from '@/payload-types';

export type ArchiveDocument = Article | Happening | Page | Case | Note;

type CollectionArchiveProps<T extends { slug: string }> = {
  docs: ArchiveDocument[];
  relationTo: 'articles' | 'happenings' | 'notes' | 'cases';
  showImages?: boolean;
};

export const CollectionArchive = <T extends { slug: string }>({ docs, relationTo, showImages = true }: CollectionArchiveProps<T>) => {
  return (
    <Grid cols={{ sm: 1, md: 2, lg: 3 }} paddingClassName="gap-4 lg:gap-8">
      {docs?.map((doc) => (
        <Card key={doc.resourceId} doc={doc} relationTo={relationTo} showImages={showImages} />
      ))}
    </Grid>
  );
};
