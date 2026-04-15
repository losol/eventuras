---
"@eventuras/ratio-ui": patch
---

fix(card): use `border-border-1` token for the default variant's border
so custom `border` and `borderColor` props override cleanly in both
light and dark mode. The previous hardcoded `border-gray-200/50` +
`dark:border-gray-700/50` meant dark mode kept the gray color even when
the consumer supplied a colored border.
