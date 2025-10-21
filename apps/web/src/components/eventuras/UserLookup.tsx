'use client';
import { getV3Users, UserDto } from '@eventuras/event-sdk';
import type { AutoCompleteDataProvider } from '@eventuras/ratio-ui/forms/InputAutocomplete';
import { InputAutoComplete } from '@eventuras/ratio-ui/forms/InputAutocomplete';

export type UserLookupProps = {
  onUserSelected?: (u: UserDto) => Promise<any> | void;
};
const UserLookup = (props: UserLookupProps) => {
  const inputDataProvider: AutoCompleteDataProvider = async (input: string) => {
    const result = await getV3Users({ query: { Query: input } });
    const data = result.data?.data ?? [];
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
