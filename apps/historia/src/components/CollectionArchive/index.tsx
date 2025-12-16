import React from 'react';

import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import { Card } from '@/components/Card';
import type { Article, Happening, Note, Organization, Page, Person, Project } from '@/payload-types';

export type ArchiveDocument = Article | Happening | Page | Project | Note;

type CollectionArchiveProps<T extends { slug: string }> = {
  docs: ArchiveDocument[];
  relationTo: 'articles' | 'happenings' | 'notes' | 'projects';
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
