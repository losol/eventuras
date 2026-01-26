import { revalidatePath } from 'next/cache';
import type { CollectionAfterChangeHook } from 'payload';

import type { Instruction } from '../../../payload-types';

export const revalidateInstruction: CollectionAfterChangeHook<Instruction> = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  const slug = doc.slug;

  if (doc._status === 'published' && typeof slug === 'string' && slug.length > 0) {
    const path = `/instructions/${slug}`;

    payload.logger.info(`Revalidating instruction at path: ${path}`);

    revalidatePath(path);
  }

  // If the instruction was previously published, we need to revalidate the old path
  const oldSlug = previousDoc?.slug;
  if (previousDoc?._status === 'published' && doc._status !== 'published' && typeof oldSlug === 'string' && oldSlug.length > 0) {
    const oldPath = `/instructions/${oldSlug}`;

    payload.logger.info(`Revalidating old instruction at path: ${oldPath}`);

    revalidatePath(oldPath);
  }

  return doc;
};
