'use client';
import type { AutoCompleteDataProvider } from '@eventuras/ratio-ui/forms/InputAutocomplete';
import { InputAutoComplete } from '@eventuras/ratio-ui/forms/InputAutocomplete';

import { searchUsers } from '@/app/(admin)/admin/actions/users';
import type { UserDto } from '@/lib/eventuras-types';

export type UserLookupProps = {
  onUserSelected?: (u: UserDto) => Promise<void> | void;
};
const UserLookup = (props: UserLookupProps) => {
  const inputDataProvider: AutoCompleteDataProvider = async (input: string) => {
    const data = await searchUsers(input);
    return {
      ok: true,
      error: null,
      value: data.map((u: UserDto) => {
        return {
          id: u.id!,
          label: u.name!,
          original: u,
        };
      }),
    };
  };
  return (
    <InputAutoComplete
      minimumAmountOfCharacters={3}
      dataProvider={inputDataProvider}
      placeholder="Find User"
      onItemSelected={props.onUserSelected}
    />
  );
};
export default UserLookup;
