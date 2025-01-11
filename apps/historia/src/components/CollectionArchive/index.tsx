import React from 'react'

import { Card } from '@/components/Card'
import type { CardDoc } from '@/components/Card'

type CollectionArchiveProps<T extends CardDoc> = {
  docs: T[];
  relationTo: "articles" | "happenings" | "pages" | "projects" | "notes";
};

export const CollectionArchive = <T extends CardDoc>(props: CollectionArchiveProps<T>) => {
  const { docs, relationTo } = props;

  return (
    <div >
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {docs?.map((doc, index) => {
            if (typeof doc === 'object' && doc !== null) {
              return (
                <div className="col-span-4" key={doc.slug}>
                  <Card className="h-full" doc={doc} relationTo={relationTo} />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};
