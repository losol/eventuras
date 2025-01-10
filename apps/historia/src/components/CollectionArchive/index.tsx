import { cn } from 'src/utilities/cn'
import React from 'react'

import { Card } from '@/components/Card'

type CollectionArchiveProps<T> = {
  docs: T[];
  relationTo: string;
};

export const CollectionArchive = <T extends object>(props: CollectionArchiveProps<T>) => {
  const { docs: items, relationTo } = props;

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {items?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo={relationTo} />
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
