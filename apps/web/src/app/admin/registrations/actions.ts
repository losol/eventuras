'use server';

import { Logger } from '@eventuras/logger';
import { revalidatePath } from 'next/cache';

const logger = Logger.create({ namespace: 'RegistrationActions' });

export default async function revalidateRegistrationCache() {
  logger.info('Revalidating registration cache');
  revalidatePath('/admin/registrations');
}
