import type { AccessArgs } from 'payload/config';

import { checkRole } from '../collections/Users/checkRole';
import type { User } from '../payload-types';

type isAdmin = (args: AccessArgs<unknown, User>) => boolean;

export const admins: isAdmin = ({ req: { user } }) => {
  const safeUser = user === null ? undefined : user;

  return checkRole(['admin'], safeUser);
};
