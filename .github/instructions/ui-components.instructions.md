---
applyTo: "libs/ratio-ui/**/*.{ts,tsx}"
---

# UI Component Guidelines for `libs/ratio-ui`

When creating or modifying components in `libs/ratio-ui`, follow these guidelines to ensure consistency, accessibility, and maintainability.

## Component Development Workflow

### 1. Create the Component First

- Focus on implementing functionality and structure
- Ensure component works correctly with all props and variants
- Test component behavior thoroughly

### 2. Ask About Storybook Stories

- **After the component is complete**, ask if Storybook stories should be created
- Don't create stories prematurely for components that might change
- User decides if documentation is needed at that moment

## Component Structure

### File Organization

```
libs/ratio-ui/
├── src/
│   ├── Button/
│   │   ├── Button.tsx          # Main component
│   │   ├── Button.stories.tsx  # Storybook stories (if requested)
│   │   └── index.ts            # Export
│   └── index.ts                # Main export file
```

### Component Template

```typescript
import { type ComponentProps } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`rounded-md font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Styling Guidelines

### Use Tailwind CSS

- Prefer Tailwind utility classes over custom CSS
- Use consistent spacing, colors, and typography from Tailwind config
- Group related utilities together (layout, spacing, colors, typography, effects)

### Variant-Based Styling

```typescript
const variants = {
  'button-primary': 'bg-primary-600 hover:bg-primary-700 text-white',
  'button-secondary': 'bg-secondary-600 hover:bg-secondary-700 text-white',
  'button-outline': 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  'button-danger': 'bg-red-600 hover:bg-red-700 text-white',
};

// Apply variant
<button className={variants[variant]} />
```

### Creating New Variants

- When existing variants don't meet design requirements, **add new variants** to the component
- Don't add custom styling in consumer code — keep styling centralized
- Document new variants in component props

## Accessibility

### Required Practices

1. **Semantic HTML** - Use appropriate HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
2. **ARIA Labels** - Add `aria-label` or `aria-labelledby` when text isn't visible
3. **Keyboard Navigation** - Ensure all interactive elements are keyboard accessible
4. **Focus Styles** - Always provide visible focus indicators
5. **Role Attributes** - Use ARIA roles when semantic HTML isn't sufficient

### React Aria Components

- Prefer using React Aria Components for complex interactive patterns
- They provide built-in accessibility and behavior
- Examples: `Dialog`, `Popover`, `ComboBox`, `Select`

```typescript
import { Button as AriaButton } from 'react-aria-components';

export function Button(props: ButtonProps) {
  return (
    <AriaButton
      className={/* styles */}
      {...props}
    >
      {props.children}
    </AriaButton>
  );
}
```

## TypeScript Best Practices

### Extend Native Props

```typescript
// ✅ Good - extends native button props
export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary";
}

// ❌ Avoid - reinventing props
export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  // ... manually defining all button props
}
```

### Use Proper Types

```typescript
// ✅ Good - specific types
variant?: 'primary' | 'secondary' | 'outline';
size?: 'sm' | 'md' | 'lg';
children: React.ReactNode;

// ❌ Avoid - too generic
variant?: string;
size?: any;
```

### Export Types

```typescript
// Always export component props for consumers
export interface ButtonProps {
  /* ... */
}
export function Button(props: ButtonProps) {
  /* ... */
}
```

## Component Composition

### Favor Composition Over Prop Drilling

```typescript
// ✅ Good - composable
<Card>
  <Card.Header>
    <Card.Title>Event Details</Card.Title>
  </Card.Header>
  <Card.Body>
    <p>Content here</p>
  </Card.Body>
</Card>

// ❌ Avoid - prop drilling
<Card
  headerTitle="Event Details"
  bodyContent={<p>Content here</p>}
/>
```

### Compound Components

```typescript
export function Card({ children, ...props }: CardProps) {
  return <div className="card" {...props}>{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="card-title">{children}</h3>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};
```

## Responsive Design

### Mobile-First Approach

```typescript
// ✅ Good - mobile-first responsive classes
<div className="text-sm md:text-base lg:text-lg" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />

// ❌ Avoid - desktop-first
<div className="text-lg md:text-sm" />
```

### Breakpoint Guidelines

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

## Documentation

### TSDoc Comments

````typescript
/**
 * A reusable button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps) {
  /* ... */
}
````

### Storybook Stories (When Requested)

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};
```

## Testing Considerations

### Component Tests

- Test component renders correctly
- Test all variants display proper styles
- Test interactive behavior (clicks, keyboard events)
- Test accessibility (ARIA attributes, keyboard navigation)

### Example Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with correct text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  screen.getByRole('button').click();
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Export Pattern

### Centralized Exports

```typescript
// libs/ratio-ui/src/index.ts
export { Button, type ButtonProps } from "./Button";
export { Card, type CardProps } from "./Card";
export { Input, type InputProps } from "./Input";
```

### Named Exports Only

```typescript
// ✅ Good - named exports
export function Button() {
  /* ... */
}

// ❌ Avoid - default exports
export default function Button() {
  /* ... */
}
```

## Common Patterns

### Forwarding Refs

```typescript
import { forwardRef, type ComponentProps } from 'react';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} className={className} {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Polymorphic Components

```typescript
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProps<C extends React.ElementType, Props = {}> =
  React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export function Text<C extends React.ElementType = 'span'>({
  as,
  children,
  ...props
}: PolymorphicComponentProps<C>) {
  const Component = as || 'span';
  return <Component {...props}>{children}</Component>;
}

// Usage:
<Text>Default span</Text>
<Text as="p">Paragraph</Text>
<Text as="h1">Heading</Text>
```

## Checklist Before Committing

- [ ] Component follows naming conventions (PascalCase)
- [ ] TypeScript props are properly typed
- [ ] Component extends native HTML element props where appropriate
- [ ] Accessibility requirements met (semantic HTML, ARIA, keyboard nav)
- [ ] Tailwind CSS used for styling
- [ ] Component is responsive (mobile-first)
- [ ] TSDoc comments added for exported functions
- [ ] Component exported from `index.ts`
- [ ] No console.log statements left in code
- [ ] Storybook stories created (if requested by user)

## Resources

- Project component guidelines: `.ai/agents/frontend-agent.md`
- React Aria Components: https://react-spectrum.adobe.com/react-aria/
- Tailwind CSS: https://tailwindcss.com/docs
