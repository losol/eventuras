import { appConfig } from '@/config.server';

/**
 * Returns the configured organization ID as a number.
 * Throws if ORGANIZATION_ID is missing or not a valid integer.
 */
export function getOrganizationId(): number {
  const raw = appConfig.env.ORGANIZATION_ID;
  const id = typeof raw === 'number' ? raw : parseInt(raw as string, 10);
  if (!id || isNaN(id)) {
    throw new Error('ORGANIZATION_ID is not configured');
  }
  return id;
}
