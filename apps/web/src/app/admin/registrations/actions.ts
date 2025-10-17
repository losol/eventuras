'use server';

import { Logger } from '@eventuras/logger';
import { revalidatePath } from 'next/cache';

const logger = Logger.create({ namespace: 'web:admin:registrations', context: { module: 'actions' } });

export default async function revalidateRegistrationCache() {
  logger.info('Revalidating registration cache');
  revalidatePath('/admin/registrations');
}
