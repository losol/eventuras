---
"@eventuras/scribo": patch
"@eventuras/web": patch
"@eventuras/api": patch
---

### Fix: Event description 300 character limit validation (#690)

- Validate markdown length (not plain text) in MarkdownInput, since markdown is what gets stored
- Block form submission via react-hook-form when description exceeds 300 characters
- Add `[StringLength(300)]` to API EventFormDto for a clear 400 response instead of 500
- Migrate scribo eslint config to flat config format
