'use client';
import { Logger } from '@eventuras/logger';
import type { AutoCompleteDataProvider } from '@eventuras/ratio-ui/forms/InputAutocomplete';
import { InputAutoComplete } from '@eventuras/ratio-ui/forms/InputAutocomplete';

import { searchUsers } from '@/app/(admin)/admin/actions/users';
import type { UserDto } from '@/lib/eventuras-types';

const logger = Logger.create({
  namespace: 'web:components:eventuras',
  context: { component: 'UserLookup' },
});

export type UserLookupProps = {
  onUserSelected?: (u: UserDto) => Promise<void> | void;
};
const UserLookup = (props: UserLookupProps) => {
  const inputDataProvider: AutoCompleteDataProvider = async (input: string) => {
    try {
      logger.info({ length: input.length }, 'Searching for users');

      const data = await searchUsers(input);

      logger.info({ resultCount: data.length }, 'User search completed');

      return {
        ok: true,
        error: null,
        value: data.map((u: UserDto) => {
          return {
            id: u.id!,
            label: `${u.name} (${u.email})`,
            original: u,
          };
        }),
      };
    } catch (error) {
      logger.error({ error }, 'Error searching for users');
      return {
        ok: false,
        error: error instanceof Error ? error : new Error('Failed to search users'),
        value: [],
      };
    }
  };
  return (
    <InputAutoComplete
      minimumAmountOfCharacters={3}
      dataProvider={inputDataProvider}
      placeholder="Search by name or email (min 3 characters)"
      onItemSelected={props.onUserSelected}
    />
  );
};
export default UserLookup;
