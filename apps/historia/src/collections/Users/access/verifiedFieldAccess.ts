import type { FieldAccess } from 'payload';

import { isSystemAdmin } from '@/access/isSystemAdmin';

/**
 * Creates field-level access control for fields protected by verification flags.
 *
 * This helper implements the access pattern from ADR 0003:
 * - Read: Everyone can read
 * - Update: System-admin OR if the verification flag is false
 *
 * @param verificationFlagName - Name of the verification flag field
 * @returns Object with field access functions for read/update
 *
 * @example
 * // Protect given_name, middle_name, family_name with name_verified flag
 * {
 *   name: 'given_name',
 *   type: 'text',
 *   access: createVerifiedFieldAccess('name_verified'),
 * }
 */
export const createVerifiedFieldAccess = (
  verificationFlagName: 'name_verified' | 'email_verified' | 'phone_number_verified',
) => ({
  read: (() => true) as FieldAccess,

  update: (({ req, data }) => {
    if (!req.user || !('email' in req.user)) return false;

    // System admins can always update
    if (isSystemAdmin(req.user)) return true;

    // Others can only update if NOT verified
    return !data?.[verificationFlagName];
  }) as FieldAccess,
});

/**
 * Field-level access control for verification flag fields themselves.
 *
 * From ADR 0003:
 * - Read: Everyone can see if data is verified
 * - Create: Only system-admin can set on create
 * - Update: Only system-admin can change status
 *
 * Applies to: name_verified, email_verified, phone_number_verified
 */
export const verificationFlagAccess = {
  read: (() => true) as FieldAccess,
  create: (({ req }) => {
    if (!req.user || !('email' in req.user)) return false;
    return isSystemAdmin(req.user);
  }) as FieldAccess,
  update: (({ req }) => {
    if (!req.user || !('email' in req.user)) return false;
    return isSystemAdmin(req.user);
  }) as FieldAccess,
};
