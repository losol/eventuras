---
"@eventuras/ratio-ui": major
---

**Breaking:** Redesign `Card` props around composable token props. The `variant` prop is gone, along with the `outline`, `wide`, and `tile` flavors. Surface, border, padding, radius, and shadow are now set independently using the same token props the rest of the library uses.

### Migration

| Before                            | After                                                            |
| --------------------------------- | ---------------------------------------------------------------- |
| `<Card variant="default">`        | `<Card>`                                                         |
| `<Card variant="outline">`        | `<Card transparent border>`                                      |
| `<Card variant="transparent">`    | `<Card transparent>`                                             |
| `<Card variant="tile">`           | `<Card padding="lg" radius="lg" shadow="none">`                  |
| `<Card variant="wide" backgroundImageUrl={…} />` | `<Card backgroundImageUrl={…} className="min-h-[33vh] mx-auto" radius="lg" border="none" shadow="none" />` (or use `Hero`, which now also accepts `backgroundImageUrl`) |

### What changed

- `variant` removed. Use `transparent?: boolean` for the unfilled surface, and the existing `color`, `border`, `radius`, `padding`, and `shadow` props for everything else.
- `BorderProps.border` accepts a new `'none'` string variant in addition to `false` / `true` / `'default'` / `'strong'` / `'subtle'`.
- New `shadow?: 'none' | 'xs' | 'sm' | 'md'` prop. Default is `'xs'` for filled cards, `'none'` for transparent cards.
- Default `padding` is `'md'`, default `radius` is `'xl'`. Border defaults to on for filled cards, off for transparent ones.
- The `Hero` block now accepts `backgroundImageUrl` and `style`, covering most cases that previously reached for `<Card variant="wide">`.
