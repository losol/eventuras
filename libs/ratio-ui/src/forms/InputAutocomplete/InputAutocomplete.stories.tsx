import { Meta, StoryFn } from '@storybook/react-vite';
import { InputAutoComplete, InputAutoCompleteProps, AutoCompleteDataProviderResult } from './InputAutoComplete';
import { fn } from 'storybook/test';

const meta: Meta<typeof InputAutoComplete> = {
  component: InputAutoComplete,
  tags: ['autodocs'],
  args: {
    placeholder: 'Start typing...',
    minimumAmountOfCharacters: 3,
    onItemSelected: fn(),
  },
};

export default meta;

type InputAutoCompleteStory = StoryFn<InputAutoCompleteProps>;

// Mock data provider for demonstration
const mockDataProvider = async (input: string): Promise<AutoCompleteDataProviderResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com' },
  ];

  const filtered = mockUsers
    .filter(
      user =>
        user.name.toLowerCase().includes(input.toLowerCase()) ||
        user.email.toLowerCase().includes(input.toLowerCase()),
    )
    .map(user => ({
      id: user.id,
      label: `${user.name} (${user.email})`,
      original: user,
    }));

  return {
    ok: true,
    value: filtered,
    error: null,
  };
};

export const Playground: InputAutoCompleteStory = args => (
  <div className="max-w-md">
    <InputAutoComplete {...args} dataProvider={mockDataProvider} />
  </div>
);

export const UserSearch: InputAutoCompleteStory = () => (
  <div className="max-w-md">
    <InputAutoComplete
      placeholder="Search for a user..."
      minimumAmountOfCharacters={2}
      dataProvider={mockDataProvider}
      onItemSelected={item => console.log('Selected:', item)}
    />
  </div>
);

export const WithLongerMinimum: InputAutoCompleteStory = () => (
  <div className="max-w-md">
    <InputAutoComplete
      placeholder="Type at least 4 characters..."
      minimumAmountOfCharacters={4}
      dataProvider={mockDataProvider}
      onItemSelected={item => console.log('Selected:', item)}
    />
  </div>
);

const mockCountryProvider = async (input: string): Promise<AutoCompleteDataProviderResult> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const countries = [
    { id: 'no', name: 'Norway' },
    { id: 'se', name: 'Sweden' },
    { id: 'dk', name: 'Denmark' },
    { id: 'fi', name: 'Finland' },
    { id: 'is', name: 'Iceland' },
    { id: 'us', name: 'United States' },
    { id: 'gb', name: 'United Kingdom' },
    { id: 'de', name: 'Germany' },
    { id: 'fr', name: 'France' },
  ];

  const filtered = countries
    .filter(country => country.name.toLowerCase().includes(input.toLowerCase()))
    .map(country => ({
      id: country.id,
      label: country.name,
      original: country,
    }));

  return {
    ok: true,
    value: filtered,
    error: null,
  };
};

export const CountrySearch: InputAutoCompleteStory = () => (
  <div className="max-w-md">
    <InputAutoComplete
      placeholder="Search for a country..."
      minimumAmountOfCharacters={2}
      dataProvider={mockCountryProvider}
      onItemSelected={item => console.log('Selected country:', item)}
    />
  </div>
);

const emptyDataProvider = async (_input: string): Promise<AutoCompleteDataProviderResult> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    ok: true,
    value: [],
    error: null,
  };
};

export const NoResults: InputAutoCompleteStory = () => (
  <div className="max-w-md">
    <InputAutoComplete
      placeholder="No results will be found..."
      minimumAmountOfCharacters={2}
      dataProvider={emptyDataProvider}
      onItemSelected={item => console.log('Selected:', item)}
    />
  </div>
);
