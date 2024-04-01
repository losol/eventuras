'use server';

import { Logger } from '@eventuras/utils';
import { revalidatePath } from 'next/cache';

export default async function revalidateRegistrationCache() {
  Logger.info({ namespace: 'cache' }, 'Revalidating registration cache');
  revalidatePath('/admin/registrations');
}
