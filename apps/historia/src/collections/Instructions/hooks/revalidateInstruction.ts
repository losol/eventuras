import { revalidatePath } from 'next/cache';
import type { CollectionAfterChangeHook } from 'payload';

import type { Instruction } from '../../../payload-types';

export const revalidateInstruction: CollectionAfterChangeHook<Instruction> = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  if (doc._status === 'published') {
    const path = `/instructions/${doc.slug}`;

    payload.logger.info(`Revalidating instruction at path: ${path}`);

    revalidatePath(path);
  }

  // If the instruction was previously published, we need to revalidate the old path
  if (previousDoc._status === 'published' && doc._status !== 'published') {
    const oldPath = `/instructions/${previousDoc.slug}`;

    payload.logger.info(`Revalidating old instruction at path: ${oldPath}`);

    revalidatePath(oldPath);
  }

  return doc;
};
