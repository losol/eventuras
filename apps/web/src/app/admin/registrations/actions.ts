'use server';

import { Logger } from '@eventuras/logger';
import { revalidatePath } from 'next/cache';

export default async function revalidateRegistrationCache() {
  Logger.info({ namespace: 'cache' }, 'Revalidating registration cache');
  revalidatePath('/admin/registrations');
}
