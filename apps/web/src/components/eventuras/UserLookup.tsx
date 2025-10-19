'use client';
import { UserDto, getV3Users } from '@eventuras/event-sdk';
import { AutoCompleteDataProvider, InputAutoComplete } from '@eventuras/ratio-ui';


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
          original: u
        };
      })
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
