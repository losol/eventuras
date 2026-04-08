'use client';

import { Logger } from '@eventuras/logger';
import { Lookup } from '@eventuras/ratio-ui/core/Lookup';

import { searchUsers } from '@/app/(admin)/admin/actions/users';
import type { UserDto } from '@/lib/eventuras-types';

const logger = Logger.create({
  namespace: 'web:components:eventuras',
  context: { component: 'UserLookup' },
});

export type UserLookupProps = {
  onUserSelected?: (u: UserDto) => Promise<void> | void;
};

async function loadUsers(query: string): Promise<UserDto[]> {
  try {
    logger.info({ length: query.length }, 'Searching for users');
    const data = await searchUsers(query);
    logger.info({ resultCount: data.length }, 'User search completed');
    return data;
  } catch (error) {
    logger.error({ error }, 'Error searching for users');
    return [];
  }
}

const UserLookup = (props: UserLookupProps) => (
  <Lookup<UserDto>
    label="Search User"
    placeholder="Search by name or email (min 3 characters)"
    minChars={3}
    load={loadUsers}
    getItemKey={u => u.id!}
    getItemLabel={u => u.name ?? ''}
    getItemTextValue={u => `${u.name ?? ''} ${u.email ?? ''}`}
    renderItem={u => (
      <div>
        <div className="font-medium">{u.name}</div>
        <div className="text-sm text-gray-600">{u.email}</div>
      </div>
    )}
    onItemSelected={u => props.onUserSelected?.(u)}
    emptyState="No users found"
  />
);

export default UserLookup;
