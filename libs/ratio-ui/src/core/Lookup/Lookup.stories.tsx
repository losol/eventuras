import type { Meta, StoryObj } from '@storybook/react';

import { Lookup } from './Lookup';

type Country = {
  id: number;
  name: string;
  code: string;
  continent: string;
};

const countries: Country[] = [
  { id: 1, name: 'Norway', code: 'NO', continent: 'Europe' },
  { id: 2, name: 'Sweden', code: 'SE', continent: 'Europe' },
  { id: 3, name: 'Denmark', code: 'DK', continent: 'Europe' },
  { id: 4, name: 'Finland', code: 'FI', continent: 'Europe' },
  { id: 5, name: 'Iceland', code: 'IS', continent: 'Europe' },
  { id: 6, name: 'United States', code: 'US', continent: 'North America' },
  { id: 7, name: 'United Kingdom', code: 'UK', continent: 'Europe' },
  { id: 8, name: 'Germany', code: 'DE', continent: 'Europe' },
  { id: 9, name: 'France', code: 'FR', continent: 'Europe' },
  { id: 10, name: 'Japan', code: 'JP', continent: 'Asia' },
  { id: 11, name: 'South Korea', code: 'KR', continent: 'Asia' },
  { id: 12, name: 'Australia', code: 'AU', continent: 'Oceania' },
];

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { id: 'u1', name: 'Emma Johnson', email: 'emma@example.com', role: 'Admin' },
  { id: 'u2', name: 'Liam Chen', email: 'liam@example.com', role: 'User' },
  { id: 'u3', name: 'Sophia Martinez', email: 'sophia@example.com', role: 'Manager' },
  { id: 'u4', name: 'Noah Anderson', email: 'noah@example.com', role: 'User' },
  { id: 'u5', name: 'Olivia Brown', email: 'olivia@example.com', role: 'Admin' },
];

// Simulate a server search with a small delay.
const searchCountries = async (query: string): Promise<Country[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const regex = new RegExp(query, 'i');
  return countries.filter(c => regex.test(c.name));
};

const searchUsers = async (query: string): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const q = query.toLowerCase();
  return users.filter(
    u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
};

const meta: Meta<typeof Lookup> = {
  component: Lookup,
  title: 'Core/Lookup',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline typeahead picker: search asynchronously, navigate results with the keyboard, pick one to trigger an action. Built on `react-aria`\'s `Autocomplete` + `ListBox` + `useAsyncList`. For a modal / Cmd+K variant, see `CommandPalette`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Lookup>;

/**
 * Minimal example. No character threshold — results appear as soon as the
 * user types anything. Selecting a country logs it via the action panel.
 */
export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-md p-4">
      <Lookup<Country>
        label="Country"
        placeholder="Search countries..."
        load={searchCountries}
        getItemKey={c => c.id}
        getItemLabel={c => c.name}
        renderItem={c => (
          <div className="flex items-center justify-between">
            <span>{c.name}</span>
            <span className="text-sm text-gray-500">{c.code}</span>
          </div>
        )}
        onItemSelected={c => console.log('Selected:', c)}
        emptyState="No countries found"
      />
    </div>
  ),
};

/**
 * With a minimum-character threshold of 3. Below the threshold, the list
 * shows `minCharsMessage` (a default is derived from `minChars` when not
 * provided).
 */
export const WithMinChars: Story = {
  render: () => (
    <div className="w-full max-w-md p-4">
      <Lookup<User>
        label="Search User"
        placeholder="Search by name or email (min 3 characters)"
        minChars={3}
        load={searchUsers}
        getItemKey={u => u.id}
        getItemLabel={u => u.name}
        getItemTextValue={u => `${u.name} ${u.email}`}
        renderItem={u => (
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-gray-600">{u.email}</div>
          </div>
        )}
        onItemSelected={u => console.log('Selected:', u)}
        emptyState="No users found"
      />
    </div>
  ),
};

/**
 * Custom rich rendering. `renderItem` can return any React node — the
 * `getItemTextValue` prop supplies a flat string for screen-reader and
 * type-ahead matching.
 */
export const RichRendering: Story = {
  render: () => (
    <div className="w-full max-w-md p-4">
      <Lookup<User>
        label="Assign to"
        placeholder="Search team members..."
        minChars={1}
        load={searchUsers}
        getItemKey={u => u.id}
        getItemLabel={u => u.name}
        getItemTextValue={u => `${u.name} ${u.email} ${u.role}`}
        renderItem={u => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {u.name
                .split(' ')
                .map(s => s[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{u.name}</div>
              <div className="text-xs text-gray-500 truncate">{u.email}</div>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${(() => {
                if (u.role === 'Admin') return 'bg-purple-100 text-purple-800';
                if (u.role === 'Manager') return 'bg-blue-100 text-blue-800';
                return 'bg-gray-100 text-gray-700';
              })()}`}
            >
              {u.role}
            </span>
          </div>
        )}
        onItemSelected={u => console.log('Selected:', u)}
        emptyState="No team members found"
      />
    </div>
  ),
};
