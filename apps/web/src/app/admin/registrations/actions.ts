'use server';

import { revalidatePath } from 'next/cache';

import Logger from '@/utils/Logger';

export default async function revalidateRegistrationCache() {
  Logger.info({ namespace: 'cache' }, 'Revalidating registration cache');
  revalidatePath('/admin/registrations');
}
