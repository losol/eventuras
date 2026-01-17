# AutoComplete Component API Design

**Status:** Proposed  
**Date:** 2026-01-17  
**Issue:** [#1088](https://github.com/losol/eventuras/issues/1088)  
**Frontend Architect:** Design Approved

---

## Design Philosophy

The new `AutoComplete` component will follow React Aria's composition patterns, providing **low-level, flexible primitives** that consumers can compose for their specific needs. We prioritize:

1. **Alignment with React Aria conventions** over custom abstractions
2. **Composability** over convenience
3. **Flexibility** for different use cases
4. **Consumer control** over built-in magic

## Decision: Single Composable Component

**Recommendation:** Build **one flexible component** (`AutoComplete`) that follows React Aria patterns.

**Rationale:**
- Consumers can build their own convenience wrappers if needed
- Easier to maintain and document
- More predictable behavior
- Encourages understanding of React Aria patterns
- Consumers already using `useAsyncList` in other components

## API Design

### Core Component: `AutoComplete`

A thin wrapper around React Aria's `Autocomplete` that provides sensible defaults while remaining highly composable.

```tsx
import { Autocomplete, SearchField, ListBox, ListBoxItem } from 'react-aria-components';
import { useAsyncList } from 'react-stately';

// Consumer example with async loading
function UserSearch() {
  const list = useAsyncList<User>({
    async load({ signal, filterText }) {
      if (!filterText || filterText.length < 3) {
        return { items: [] };
      }
      
      const res = await searchUsers(filterText, { signal });
      return { items: res };
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

### Component Props

```typescript
interface AutoCompleteProps {
  /**
   * The children to render inside the autocomplete.
   * Must include a TextField/SearchField and a collection (ListBox, Menu, etc.)
   */
  children: ReactNode;

  /**
   * The current input value (controlled).
   */
  inputValue?: string;

  /**
   * Handler called when the input value changes.
   */
  onInputChange?: (value: string) => void;

  /**
   * Optional filter function for client-side filtering.
   * When omitted, filtering is expected to be handled by the consumer (e.g., async).
   */
  filter?: (textValue: string, inputValue: string, node: Node<object>) => boolean;

  /**
   * Whether to auto-focus the first item after filtering.
   * @default false
   */
  disableAutoFocusFirst?: boolean;

  /**
   * Whether to disable virtual focus (makes collection directly tabbable).
   * @default false
   */
  disableVirtualFocus?: boolean;

  /**
   * Optional loading state to show loading indicator.
   */
  isLoading?: boolean;

  /**
   * Additional CSS class name for styling.
   */
  className?: string;

  /**
   * Selection mode for the collection.
   * Passed through to the collection component context.
   */
  selectionMode?: 'none' | 'single' | 'multiple';

  /**
   * Handler called when selection changes.
   */
  onSelectionChange?: (keys: Selection) => void;
}
```

### Styling Approach

The component will use Tailwind CSS with `tailwindcss-react-aria-components` for state-based styling:

```tsx
<AutoComplete className="group relative w-full max-w-md">
  <SearchField className="flex flex-col gap-1">
    <Label>Search</Label>
    <div className="relative flex items-center">
      <Input className="w-full px-3 py-2 border rounded-md" />
      {isLoading && (
        <div className="absolute right-3 pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
    </div>
  </SearchField>
  
  <ListBox className="
    mt-1 max-h-60 w-full overflow-auto
    rounded-md bg-white shadow-lg border
    entering:animate-in entering:fade-in
    exiting:animate-out exiting:fade-out
  ">
    {/* items */}
  </ListBox>
</AutoComplete>
```

## Usage Patterns

### Pattern 1: Async Search (Most Common)

```tsx
import { AutoComplete } from '@eventuras/ratio-ui/forms/Autocomplete';
import { SearchField, ListBox, ListBoxItem } from 'react-aria-components';
import { useAsyncList } from 'react-stately';

function EventSearch({ onEventSelect }) {
  const list = useAsyncList<Event>({
    async load({ signal, filterText }) {
      const events = await fetchEvents(filterText, { signal });
      return { items: events };
    }
  });

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      isLoading={list.isLoading}
      onSelectionChange={(keys) => {
        const eventId = Array.from(keys)[0];
        const event = list.items.find(e => e.id === eventId);
        if (event) onEventSelect(event);
      }}
    >
      <SearchField label="Search Events" placeholder="Event name" />
      <ListBox items={list.items} renderEmptyState={() => 'No events found'}>
        {(event) => (
          <ListBoxItem textValue={event.title}>
            {event.title}
          </ListBoxItem>
        )}
      </ListBox>
    </AutoComplete>
  );
}
```

### Pattern 2: Client-Side Filtering

```tsx
function CategoryFilter({ categories, onSelect }) {
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

### Pattern 3: With Custom Rendering

```tsx
function UserAutocomplete() {
  const list = useAsyncList<User>({ /* ... */ });

  return (
    <AutoComplete
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      isLoading={list.isLoading}
    >
      <SearchField label="Search Users" />
      <ListBox items={list.items}>
        {(user) => (
          <ListBoxItem textValue={`${user.name} ${user.email}`}>
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} />
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              {user.role === 'admin' && (
                <Badge variant="primary">Admin</Badge>
              )}
            </div>
          </ListBoxItem>
        )}
      </ListBox>
    </AutoComplete>
  );
}
```

## Migration Guide for Existing Components

### Before (Old API)

```tsx
// Old InputAutoComplete
const dataProvider = async (input: string) => {
  const users = await searchUsers(input);
  return {
    ok: true,
    error: null,
    value: users.map(u => ({
      id: u.id,
      label: `${u.name} (${u.email})`,
      original: u
    }))
  };
};

<InputAutoComplete
  minimumAmountOfCharacters={3}
  dataProvider={dataProvider}
  placeholder="Search users"
  onItemSelected={handleSelect}
/>
```

### After (New API)

```tsx
// New AutoComplete
const list = useAsyncList<User>({
  async load({ signal, filterText }) {
    if (!filterText || filterText.length < 3) {
      return { items: [] };
    }
    const users = await searchUsers(filterText, { signal });
    return { items: users };
  }
});

<AutoComplete
  inputValue={list.filterText}
  onInputChange={list.setFilterText}
  isLoading={list.isLoading}
  onSelectionChange={(keys) => {
    const userId = Array.from(keys)[0];
    const user = list.items.find(u => u.id === userId);
    if (user) handleSelect(user);
  }}
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
      <ListBoxItem textValue={`${user.name} ${user.email}`}>
        {user.name} ({user.email})
      </ListBoxItem>
    )}
  </ListBox>
</AutoComplete>
```

## Component Structure

```
libs/ratio-ui/src/forms/Autocomplete/
├── index.ts              # Public exports
├── AutoComplete.tsx      # Main component
├── AutoComplete.test.tsx # Unit tests
├── AutoComplete.stories.tsx # Storybook stories
└── README.md            # Component documentation
```

## Export Strategy

```typescript
// libs/ratio-ui/src/forms/Autocomplete/index.ts
export { AutoComplete } from './AutoComplete';
export type { AutoCompleteProps } from './AutoComplete';

// Re-export commonly used React Aria components for convenience
export { 
  SearchField, 
  TextField,
  ListBox, 
  ListBoxItem 
} from 'react-aria-components';
```

## Accessibility Considerations

- ✅ Follows ARIA Autocomplete pattern
- ✅ Keyboard navigation (arrows, enter, escape)
- ✅ Screen reader announcements for results
- ✅ Focus management
- ✅ Proper ARIA attributes via React Aria
- ✅ Loading state announcements

## Benefits of This Design

1. **React Aria Native** - Directly uses React Aria patterns, easier to understand and maintain
2. **Flexible** - Consumers can customize every aspect
3. **Type Safe** - Full TypeScript support with generic types
4. **Testable** - Simple, predictable behavior
5. **Documented** - Aligns with official React Aria docs
6. **Future Proof** - Updates with React Aria releases
7. **Composable** - Can be combined with other React Aria components
8. **No Lock-in** - Consumers can easily swap or extend

## Breaking Changes from Old API

| Old API | New API | Migration |
|---------|---------|-----------|
| `dataProvider` prop | `useAsyncList` hook | Move data fetching to consumer |
| `minimumAmountOfCharacters` | Logic in `load` | Add condition in load function |
| `itemRenderer` | Render prop children | Use ListBoxItem children |
| `onItemSelected` | `onSelectionChange` | Extract item from selection keys |
| `AutoCompleteItem` type | Generic type | Use your actual data type |

## Documentation Deliverables

1. **Component README** with:
   - Installation
   - Basic usage
   - Props API
   - Common patterns
   - Accessibility notes

2. **Storybook Stories** showing:
   - Basic autocomplete
   - Async search
   - Client-side filtering
   - Custom rendering
   - Loading states
   - Empty states
   - Multiple selection

3. **Migration Guide** for existing consumers

4. **JSDoc Comments** on all props and methods

## Approval & Next Steps

**Frontend Architect Approval:** ✅ Approved

**Next Steps:**
1. @Frontend Developer - Implement `AutoComplete` component
2. @Frontend Developer - Create comprehensive Storybook stories
3. @Frontend Developer - Update `EventLookup` component
4. @Frontend Developer - Update `UserLookup` component
5. @Frontend Developer - Update documentation
6. @Frontend Developer - Verify E2E tests pass

---

**Questions or Concerns?** Comment on [issue #1088](https://github.com/losol/eventuras/issues/1088)
