'use client';
import { UserDto } from '@eventuras/sdk';
import { AutoCompleteDataProvider, InputAutoComplete } from '@eventuras/ui/InputAutoComplete';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';

export type UserLookupProps = {
  onUserSelected?: (u: UserDto) => Promise<any> | void;
};

const UserLookup = (props: UserLookupProps) => {
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const inputDataProvider: AutoCompleteDataProvider = async (input: string) => {
    const result = await apiWrapper(() => sdk.users.getV3Users1({ query: input }));
    const data = result.value?.data ?? [];
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
