'use client';
import { UserDto } from '@eventuras/sdk';
import { InputAutoComplete } from '@eventuras/ui';
import { Loading } from '@eventuras/ui';
import { AutoCompleteDataProvider } from '@eventuras/ui';
import { Combobox, Transition } from '@headlessui/react';
import { IconArrowDown } from '@tabler/icons-react';
import React, { Fragment, useCallback, useRef, useState } from 'react';

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
