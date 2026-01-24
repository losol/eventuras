import type { FieldHook } from 'payload';

import { isSystemAdmin } from '@/access/isSystemAdmin';

/**
 * Hook to protect API key fields from being modified by non-system-admins.
 *
 * This provides defense-in-depth alongside field-level access control.
 * Even if field-level access is bypassed, this hook ensures only system
 * admins can modify enableAPIKey, apiKey, or apiKeyIndex fields.
 */
export const protectApiKeyFields: FieldHook = ({ req, operation, value, originalDoc, field }) => {
  const { user } = req;

  // Allow operations without a user (e.g., initial seed, migrations)
  if (!user) {
    return value;
  }

  // Check if user is a system admin
  if (user && 'email' in user && isSystemAdmin(user)) {
    return value;
  }

  // For non-admin users, preserve original value (block changes)
  if (operation === 'update' && originalDoc && field?.name) {
    // Return the original value, preventing any changes
    return originalDoc[field.name];
  }

  // For create operations by non-admins, return undefined (prevent setting)
  return undefined;
};
