import type { Access } from 'payload';

import { isSystemAdmin } from './isSystemAdmin';

/**
 * Allows admins to always create websites.
 * For non-admins: allows creation if no websites exist yet (first website scenario).
 * This enables bootstrapping in production where the first user needs to create their website.
 */
export const authenticatedOrFirstWebsite: Access = async ({ req: { user, payload } }) => {
  // System admins can always create
  if (user && 'email' in user && isSystemAdmin(user)) {
    return true;
  }

  // For authenticated users, check if there are any websites yet
  if (user) {
    const websites = await payload.find({
      collection: 'websites',
      limit: 0,
      depth: 0,
    });

    // Allow creation if no websites exist (bootstrapping scenario)
    return websites.totalDocs === 0;
  }

  return false;
};
