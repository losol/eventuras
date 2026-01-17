import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useAsyncList } from 'react-stately';

import {
  AutoComplete,
  SearchField,
  Label,
  Input,
  ListBox,
  ListBoxItem,
} from './index';

const meta: Meta<typeof AutoComplete> = {
  component: AutoComplete,
  title: 'Forms/AutoComplete',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A composable autocomplete component built on React Aria. Supports async loading, client-side filtering, and custom rendering.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

type Country = {
  id: number;
  name: string;
  code: string;
  continent: string;
  population: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Manager';
  avatar: string;
  department: string;
};

type Event = {
  id: number;
  title: string;
  location: string;
  date: string;
  category: string;
  attendees: number;
};

// Mock data - Countries
const countries: Country[] = [
  { id: 1, name: 'Norway', code: 'NO', continent: 'Europe', population: '5.5M' },
  { id: 2, name: 'Sweden', code: 'SE', continent: 'Europe', population: '10.5M' },
  { id: 3, name: 'Denmark', code: 'DK', continent: 'Europe', population: '5.9M' },
  { id: 4, name: 'Finland', code: 'FI', continent: 'Europe', population: '5.6M' },
  { id: 5, name: 'Iceland', code: 'IS', continent: 'Europe', population: '0.4M' },
  { id: 6, name: 'United States', code: 'US', continent: 'North America', population: '331M' },
  { id: 7, name: 'United Kingdom', code: 'UK', continent: 'Europe', population: '68M' },
  { id: 8, name: 'Germany', code: 'DE', continent: 'Europe', population: '84M' },
  { id: 9, name: 'France', code: 'FR', continent: 'Europe', population: '67M' },
  { id: 10, name: 'Spain', code: 'ES', continent: 'Europe', population: '47M' },
  { id: 11, name: 'Italy', code: 'IT', continent: 'Europe', population: '60M' },
  { id: 12, name: 'Netherlands', code: 'NL', continent: 'Europe', population: '17M' },
  { id: 13, name: 'Belgium', code: 'BE', continent: 'Europe', population: '11.6M' },
  { id: 14, name: 'Switzerland', code: 'CH', continent: 'Europe', population: '8.7M' },
  { id: 15, name: 'Austria', code: 'AT', continent: 'Europe', population: '9M' },
  { id: 16, name: 'Poland', code: 'PL', continent: 'Europe', population: '38M' },
  { id: 17, name: 'Portugal', code: 'PT', continent: 'Europe', population: '10.3M' },
  { id: 18, name: 'Greece', code: 'GR', continent: 'Europe', population: '10.4M' },
  { id: 19, name: 'Canada', code: 'CA', continent: 'North America', population: '38M' },
  { id: 20, name: 'Mexico', code: 'MX', continent: 'North America', population: '128M' },
  { id: 21, name: 'Brazil', code: 'BR', continent: 'South America', population: '214M' },
  { id: 22, name: 'Argentina', code: 'AR', continent: 'South America', population: '46M' },
  { id: 23, name: 'Japan', code: 'JP', continent: 'Asia', population: '125M' },
  { id: 24, name: 'South Korea', code: 'KR', continent: 'Asia', population: '52M' },
  { id: 25, name: 'China', code: 'CN', continent: 'Asia', population: '1.4B' },
  { id: 26, name: 'India', code: 'IN', continent: 'Asia', population: '1.4B' },
  { id: 27, name: 'Australia', code: 'AU', continent: 'Oceania', population: '26M' },
  { id: 28, name: 'New Zealand', code: 'NZ', continent: 'Oceania', population: '5.1M' },
  { id: 29, name: 'Singapore', code: 'SG', continent: 'Asia', population: '5.7M' },
  { id: 30, name: 'Ireland', code: 'IE', continent: 'Europe', population: '5.1M' },
];

// Mock data - Users with detailed profiles
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    role: 'Admin',
    avatar: '👩‍💼',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Liam Chen',
    email: 'liam.chen@example.com',
    role: 'User',
    avatar: '👨‍💻',
    department: 'Engineering',
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    role: 'Manager',
    avatar: '👩‍💼',
    department: 'Product',
  },
  {
    id: 4,
    name: 'Noah Anderson',
    email: 'noah.anderson@example.com',
    role: 'User',
    avatar: '👨‍🔧',
    department: 'Operations',
  },
  {
    id: 5,
    name: 'Olivia Brown',
    email: 'olivia.brown@example.com',
    role: 'Admin',
    avatar: '👩‍🎨',
    department: 'Design',
  },
  {
    id: 6,
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    role: 'User',
    avatar: '👨‍💼',
    department: 'Sales',
  },
  {
    id: 7,
    name: 'Ava Garcia',
    email: 'ava.garcia@example.com',
    role: 'User',
    avatar: '👩‍💻',
    department: 'Engineering',
  },
  {
    id: 8,
    name: 'William Taylor',
    email: 'william.taylor@example.com',
    role: 'Manager',
    avatar: '👨‍🏫',
    department: 'Marketing',
  },
  {
    id: 9,
    name: 'Isabella Lee',
    email: 'isabella.lee@example.com',
    role: 'User',
    avatar: '👩‍🔬',
    department: 'Research',
  },
  {
    id: 10,
    name: 'Benjamin Kim',
    email: 'benjamin.kim@example.com',
    role: 'Admin',
    avatar: '👨‍⚖️',
    department: 'Legal',
  },
  {
    id: 11,
    name: 'Mia Rodriguez',
    email: 'mia.rodriguez@example.com',
    role: 'User',
    avatar: '👩‍🎓',
    department: 'Education',
  },
  {
    id: 12,
    name: 'Lucas Nguyen',
    email: 'lucas.nguyen@example.com',
    role: 'User',
    avatar: '👨‍🚀',
    department: 'Innovation',
  },
];

// Mock data - Events
const mockEvents: Event[] = [
  {
    id: 1,
    title: 'React Conference 2026',
    location: 'Oslo, Norway',
    date: '2026-05-15',
    category: 'Technology',
    attendees: 450,
  },
  {
    id: 2,
    title: 'Web Summit',
    location: 'Lisbon, Portugal',
    date: '2026-11-04',
    category: 'Technology',
    attendees: 70000,
  },
  {
    id: 3,
    title: 'Design Systems Workshop',
    location: 'Stockholm, Sweden',
    date: '2026-03-22',
    category: 'Design',
    attendees: 120,
  },
  {
    id: 4,
    title: 'JavaScript Meetup',
    location: 'Copenhagen, Denmark',
    date: '2026-02-10',
    category: 'Technology',
    attendees: 80,
  },
  {
    id: 5,
    title: 'UX/UI Bootcamp',
    location: 'Helsinki, Finland',
    date: '2026-06-18',
    category: 'Design',
    attendees: 60,
  },
  {
    id: 6,
    title: 'DevOps Days',
    location: 'Berlin, Germany',
    date: '2026-09-12',
    category: 'Technology',
    attendees: 300,
  },
  {
    id: 7,
    title: 'Accessibility Conference',
    location: 'Amsterdam, Netherlands',
    date: '2026-04-25',
    category: 'Accessibility',
    attendees: 200,
  },
  {
    id: 8,
    title: 'Product Management Summit',
    location: 'London, UK',
    date: '2026-07-08',
    category: 'Business',
    attendees: 500,
  },
  {
    id: 9,
    title: 'Agile Workshop',
    location: 'Oslo, Norway',
    date: '2026-01-30',
    category: 'Business',
    attendees: 100,
  },
  {
    id: 10,
    title: 'TypeScript Deep Dive',
    location: 'Stockholm, Sweden',
    date: '2026-08-14',
    category: 'Technology',
    attendees: 150,
  },
];

// Mock API for async examples
const mockSearchAPI = async (query: string, delay = 500): Promise<Country[]> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  const regex = new RegExp(query, 'gi');
  return countries.filter(c => regex.test(c.name));
};

/**
 * Client-side filtering example.
 * Uses the `filter` prop to filter a static list.
 */
export const ClientSideFiltering: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="w-full max-w-md p-4">
        <AutoComplete
          inputValue={inputValue}
          onInputChange={(value) => {
            if (selected && value !== selected) {
              setSelected(null);
            }
            setInputValue(value);
          }}
          filter={(textValue, inputValue) => {
            if (!inputValue) return false;
            if (selected && inputValue === selected) return false;
            return textValue.toLowerCase().includes(inputValue.toLowerCase());
          }}
        >
          <SearchField className="flex flex-col gap-1">
            <Label>Country</Label>
            <Input placeholder="Search countries..." />
          </SearchField>
          <ListBox
            items={countries}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const countryId = Array.from(keys)[0] as number;
              const country = countries.find(c => c.id === countryId);
              if (country) {
                setSelected(country.name);
                setInputValue(country.name);
              }
            }}
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {inputValue ? 'No countries found' : 'Start typing to search'}
              </div>
            )}
          >
            {item => {
              const country = item as Country;
              return (
                <ListBoxItem textValue={country.name}>
                  {country.name} ({country.code})
                </ListBoxItem>
              );
            }}
          </ListBox>
        </AutoComplete>
      </div>
    );
  },
};

/**
 * Async search pattern with useAsyncList.
 * Shows loading state and minimum character threshold.
 */
export const AsyncSearch: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    const list = useAsyncList<typeof countries[number]>({
      async load({ signal, filterText }) {
        if (selected && filterText === selected) {
          return { items: [] };
        }

        if (!filterText || filterText.length < 2) {
          return { items: [] };
        }

        const results = await mockSearchAPI(filterText);
        return { items: results };
      },
    });

    return (
      <div className="w-full max-w-md p-4">
        <AutoComplete
          inputValue={list.filterText}
          onInputChange={(value) => {
            if (selected && value !== selected) {
              setSelected(null);
            }
            list.setFilterText(value);
          }}
          isLoading={list.isLoading}
        >
          <SearchField className="flex flex-col gap-1">
            <Label>Search Countries</Label>
            <div className="relative">
              <Input
                className="w-full pr-10"
                placeholder="Type at least 2 characters..."
              />
              {list.isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </SearchField>
          <ListBox
            items={list.items}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const countryId = Array.from(keys)[0] as number;
              const country = list.items.find(c => c.id === countryId);
              if (country) {
                setSelected(country.name);
                list.setFilterText(country.name);
              }
            }}
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {list.filterText.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No countries found'}
              </div>
            )}
          >
            {item => {
              const country = item as Country;
              return (
                <ListBoxItem textValue={country.name}>
                  <div className="flex items-center justify-between">
                    <span>{country.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {country.code}
                    </span>
                  </div>
                </ListBoxItem>
              );
            }}
          </ListBox>
        </AutoComplete>
      </div>
    );
  },
};

/**
 * Custom rendering with rich content.
 * Shows how to render complex items with multiple lines and badges.
 */
export const CustomRendering: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');

    return (
      <div className="w-full max-w-md p-4">
        <AutoComplete
          inputValue={inputValue}
          onInputChange={setInputValue}
          filter={(textValue, inputValue) => {
            if (!inputValue) return false;
            return textValue.toLowerCase().includes(inputValue.toLowerCase());
          }}
        >
          <SearchField className="flex flex-col gap-1">
            <Label>Search Users</Label>
            <Input placeholder="Search by name, email, or department..." />
          </SearchField>
          <ListBox
            items={mockUsers}
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {inputValue ? 'No users found' : 'Start typing to search'}
              </div>
            )}
          >
            {item => {
              const user = item as User;
              return (
              <ListBoxItem textValue={`${user.name} ${user.email} ${user.department}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-gray-600 truncate">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.department}</div>
                    </div>
                    {(user.role === 'Admin' || user.role === 'Manager') && (
                      <div
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </div>
                    )}
                  </div>
                </ListBoxItem>
              );
              }}
            </ListBox>
        </AutoComplete>
      </div>
    );
  },
};

/**
 * With selection handler.
 * Shows how to handle item selection and display the selected value.
 */
export const WithSelectionHandler: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelectionChange = (keys: any) => {
      const countryId = Array.from(keys)[0] as number;
      const country = countries.find(c => c.id === countryId);
      if (country) {
        setSelected(country.name);
        setInputValue(country.name);
      }
    };

    return (
      <div className="w-full max-w-md space-y-4 p-4">
        <AutoComplete
          inputValue={inputValue}
          onInputChange={setInputValue}
          filter={(textValue, filterValue) => {
            if (!filterValue) return false;
            // Don't show dropdown if input exactly matches the selected value
            if (selected && filterValue === selected) return false;
            return textValue.toLowerCase().includes(filterValue.toLowerCase());
          }}
        >
          <SearchField className="flex flex-col gap-1">
            <Label>Select Country</Label>
            <Input placeholder="Type to search..." />
          </SearchField>
          <ListBox
            items={countries}
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {inputValue ? 'No countries found' : 'Start typing to search'}
              </div>
            )}
          >
            {item => {
              const country = item as Country;
              return (
                <ListBoxItem textValue={country.name}>
                  {country.name}
                </ListBoxItem>
              );
            }}
          </ListBox>
        </AutoComplete>

        {selected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {selected}
            </p>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Minimal example showing the simplest usage.
 */
export const Minimal: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div className="p-8 min-h-100">
        <div className="max-w-md">
          <p className="text-sm text-gray-600 mb-4">
            Start typing to filter countries (e.g., "nor", "swe")
          </p>
          <AutoComplete
            inputValue={inputValue}
            onInputChange={(value) => {
              if (selected && value !== selected) {
                setSelected(null);
              }
              setInputValue(value);
            }}
            filter={(textValue, inputValue) => {
              // Only show results when user has typed something
              if (!inputValue) return false;
              if (selected && inputValue === selected) return false;
              return textValue.toLowerCase().includes(inputValue.toLowerCase());
            }}
          >
            <SearchField>
              <Label>Search Countries</Label>
              <Input placeholder="Type to search..." />
            </SearchField>
            <ListBox
              items={countries}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const countryId = Array.from(keys)[0] as number;
                const country = countries.find(c => c.id === countryId);
                if (country) {
                  setSelected(country.name);
                  setInputValue(country.name);
                }
              }}
              renderEmptyState={() => (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {inputValue ? 'No countries found' : 'Start typing to search'}
                </div>
              )}
            >
              {item => {
                const country = item as Country;
                return (
                  <ListBoxItem textValue={country.name}>
                    {country.name}
                  </ListBoxItem>
                );
              }}
            </ListBox>
          </AutoComplete>
          <p className="text-xs text-gray-500 mt-2">
            Current input: "{inputValue}"
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Event search with detailed event information.
 * Demonstrates searching through events with multiple data points.
 */
export const EventSearch: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');

    return (
      <div className="w-full max-w-2xl p-4">
        <AutoComplete
          inputValue={inputValue}
          onInputChange={setInputValue}
          filter={(textValue, inputValue) => {
            if (!inputValue) return false;
            return textValue.toLowerCase().includes(inputValue.toLowerCase());
          }}
        >
          <SearchField className="flex flex-col gap-1">
            <Label>Search Events</Label>
            <Input placeholder="Search by title, location, or category..." />
          </SearchField>
          <ListBox
            className="max-h-72"
            items={mockEvents}
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {inputValue ? 'No events found' : 'Start typing to search'}
              </div>
            )}
          >
            {item => {
              const event = item as Event;
              return (
                <ListBoxItem
                  textValue={`${event.title} ${event.location} ${event.category}`}
                  className="px-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {event.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{event.attendees.toLocaleString()} attendees</span>
                      </div>
                    </div>
                  </div>
                </ListBoxItem>
              );
            }}
            </ListBox>
        </AutoComplete>
      </div>
    );
  },
};
