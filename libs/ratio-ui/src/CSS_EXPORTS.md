# CSS Exports

ratio-ui provides flexible CSS imports to support different use cases:

## 1. Full Page Styling (`ratio-ui.css`)

Import this for complete page control with global styles:

```typescript
import '@eventuras/ratio-ui/ratio-ui.css';
```

**Includes:**
- Design tokens (colors, spacing, typography, borders)
- Global page layout (html, body, main)
- Typography styles (h1-h6, p, blockquote)  
- Component styles
- Utility classes

**Use when:**
- Building a new app from scratch
- You want ratio-ui to control the entire page design
- You're okay with global body and typography styles

## 2. Component-Only Styling (`components.css`)

Import this to use ratio-ui components without global page takeover:

```typescript
import '@eventuras/ratio-ui/components.css';
```

**Includes:**
- Design tokens (colors, spacing, typography, borders)
- Component styles
- Utility classes

**Excludes:**
- Global html/body styling
- Global typography (h1-h6, p, blockquote)

**Use when:**
- Integrating ratio-ui into an existing app with its own design system
- You only want to use specific components
- You want to control your own global styles

## 3. Global Page Styles Only (`global.css`)

Import this if you want only the page-level styles:

```typescript
import '@eventuras/ratio-ui/global.css';
```

**Includes:**
- Theme initialization (prevents FOUC)
- Global html/body styling
- Main layout styling

**Use when:**
- You want the page structure but will use custom components
- Building a custom design system on top of ratio-ui foundations

## Migration Example

If you're currently using `ratio-ui.css` but want to avoid global styles:

```diff
- import '@eventuras/ratio-ui/ratio-ui.css';
+ import '@eventuras/ratio-ui/components.css';
```

Then add your own global styles as needed in your app.

## Modular Approach

You can also combine imports for maximum control:

```typescript
// Use tokens + your own layout
import '@eventuras/ratio-ui/components.css';

// Or build completely custom by importing individual token files
// (advanced - requires direct file system access to node_modules)
```
