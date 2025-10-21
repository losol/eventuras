import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ArchiveDocument, CollectionArchive } from '@/components/CollectionArchive'
import RichText from '@/components/RichText'
import type {  ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    showImages?: boolean
}
> = async (props) => {
  const { id, description, limit: limitFromProps, relationTo, showImages, topics } = props;

  const limit = limitFromProps || 5;

  let docs: ArchiveDocument[] = [];

  const flattenedTopics = topics?.map((topic) =>
    typeof topic === "object" ? topic.id : topic
  ) ?? [];

  if (relationTo) {
    const payload = await getPayload({ config: configPromise });

    // Fetch documents based on the collection type
    const fetchedDocs = await payload.find({
      collection: relationTo,
      depth: 1,
      limit,
      where: {
        ...(flattenedTopics && flattenedTopics.length > 0 && {
          topics: {
            in: flattenedTopics,
          },
        }),
      },
    });

    docs = fetchedDocs.docs;
  }
  return (
    <div className="my-16" id={`block-${id}`}>
      {description && (
        <div className="prose mb-16">
          <RichText className="ml-0 max-w-[48rem]" data={description} enableGutter={false} />
        </div>
      )}
      <CollectionArchive docs={docs} relationTo={relationTo!} showImages={showImages}/>
    </div>
  );
};
