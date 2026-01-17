# AutoComplete

A composable autocomplete component built on React Aria's Autocomplete primitive.

## Installation

```tsx
import { AutoComplete } from '@eventuras/ratio-ui/forms/Autocomplete';
import { SearchField, ListBox, ListBoxItem } from 'react-aria-components';
import { useAsyncList } from 'react-stately';
```

## Basic Usage

### Async Search Pattern

```tsx
function UserSearch() {
  const list = useAsyncList<User>({
    async load({ signal, filterText }) {
      if (!filterText || filterText.length < 3) {
        return { items: [] };
      }
      
      const users = await searchUsers(filterText, { signal });
      return { items: users };
    }
  });

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      isLoading={list.isLoading}
    >
      <SearchField 
        label="Search Users"
        placeholder="Type at least 3 characters"
      />
      <ListBox
        items={list.items}
        renderEmptyState={() => 
          list.filterText.length < 3 
            ? 'Type at least 3 characters'
            : 'No users found'
        }
      >
        {(user) => (
          <ListBoxItem textValue={user.name}>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </ListBoxItem>
        )}
      </ListBox>
    </AutoComplete>
  );
}
```

### Client-Side Filtering

```tsx
function CategoryFilter({ categories }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <AutoComplete
      inputValue={inputValue}
      onInputChange={setInputValue}
      filter={(textValue, inputValue) => 
        textValue.toLowerCase().includes(inputValue.toLowerCase())
      }
    >
      <SearchField label="Filter Categories" />
      <ListBox items={categories}>
        {(cat) => <ListBoxItem>{cat.name}</ListBoxItem>}
      </ListBox>
    </AutoComplete>
  );
}
```

### With Selection Handler

```tsx
function EventPicker({ onEventSelect }) {
  const list = useAsyncList<Event>({ /* ... */ });
  
  const handleSelectionChange = (keys: Selection) => {
    const eventId = Array.from(keys)[0];
    const event = list.items.find(e => e.id === eventId);
    if (event) onEventSelect(event);
  };

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      onSelectionChange={handleSelectionChange}
    >
      <SearchField label="Select Event" />
      <ListBox items={list.items}>
        {(event) => <ListBoxItem>{event.title}</ListBoxItem>}
      </ListBox>
    </AutoComplete>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | TextField/SearchField + collection component |
| `inputValue` | `string` | - | Current input value (controlled) |
| `onInputChange` | `(value: string) => void` | - | Handler for input changes |
| `filter` | `(textValue, inputValue, node) => boolean` | - | Optional client-side filter function |
| `disableAutoFocusFirst` | `boolean` | `false` | Disable auto-focus on first item |
| `disableVirtualFocus` | `boolean` | `false` | Disable virtual focus behavior |
| `isLoading` | `boolean` | - | Loading state indicator |
| `className` | `string` | - | Additional CSS classes |
| `onSelectionChange` | `(keys: Selection) => void` | - | Handler for selection changes |

## Accessibility

- ✅ ARIA Autocomplete pattern
- ✅ Keyboard navigation (arrows, enter, escape)
- ✅ Screen reader support
- ✅ Focus management
- ✅ Loading state announcements

## Migration from InputAutoComplete

**Before:**
```tsx
const dataProvider = async (input: string) => {
  const users = await searchUsers(input);
  return {
    ok: true,
    value: users.map(u => ({ id: u.id, label: u.name, original: u }))
  };
};

<InputAutoComplete
  minimumAmountOfCharacters={3}
  dataProvider={dataProvider}
  onItemSelected={handleSelect}
/>
```

**After:**
```tsx
const list = useAsyncList<User>({
  async load({ filterText }) {
    if (!filterText || filterText.length < 3) return { items: [] };
    const users = await searchUsers(filterText);
    return { items: users };
  }
});

<AutoComplete
  inputValue={list.filterText}
  onInputChange={list.setFilterText}
  onSelectionChange={(keys) => {
    const user = list.items.find(u => u.id === Array.from(keys)[0]);
    if (user) handleSelect(user);
  }}
>
  <SearchField label="Search Users" />
  <ListBox items={list.items} renderEmptyState={() => 'No results'}>
    {(user) => <ListBoxItem>{user.name}</ListBoxItem>}
  </ListBox>
</AutoComplete>
```

## References

- [React Aria Autocomplete](https://react-aria.adobe.com/Autocomplete.html)
- [React Stately useAsyncList](https://react-spectrum.adobe.com/react-stately/useAsyncList.html)
