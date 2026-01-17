'use client';
import { Input, Label, Popover } from 'react-aria-components';
import { useAsyncList } from 'react-stately';

import { Logger } from '@eventuras/logger';
import {
  AutoComplete,
  ListBox,
  ListBoxItem,
  SearchField,
} from '@eventuras/ratio-ui/forms/Autocomplete';

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
  const list = useAsyncList<UserDto>({
    async load({ signal, filterText }) {
      if (!filterText || filterText.length < 3) {
        return { items: [] };
      }

      try {
        logger.info({ length: filterText.length }, 'Searching for users');

        const data = await searchUsers(filterText);

        logger.info({ resultCount: data.length }, 'User search completed');

        return { items: data };
      } catch (error) {
        logger.error({ error }, 'Error searching for users');
        return { items: [] };
      }
    },
  });

  const handleSelectionChange = (keys: any) => {
    const userId = Array.from(keys)[0] as string;
    const user = list.items.find(u => u.id === userId);
    if (user && props.onUserSelected) {
      props.onUserSelected(user);
    }
  };

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      isLoading={list.isLoading}
    >
      <SearchField className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Search User</Label>
        <div className="relative">
          <Input
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name or email (min 3 characters)"
          />
          {list.isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </SearchField>
      <Popover className="w-[--trigger-width] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <ListBox
          items={list.items}
          className="outline-none"
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
          renderEmptyState={() => (
            <div className="px-3 py-2 text-sm text-gray-500">
              {list.filterText.length < 3
                ? 'Type at least 3 characters to search'
                : 'No users found'}
            </div>
          )}
        >
          {user => (
            <ListBoxItem
              textValue={`${user.name} ${user.email}`}
              className="px-3 py-2 cursor-pointer outline-none hover:bg-blue-50 focus:bg-blue-100"
            >
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AutoComplete>
  );
};

export default UserLookup;
