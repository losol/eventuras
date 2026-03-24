---
"@eventuras/scribo": minor
---

### Callout plugin

- Add `@eventuras/scribo/plugins/callout` — callout blocks with rich text content (NOTE, TIP, IMPORTANT, WARNING, CAUTION)
- CalloutNode is an ElementNode — supports full rich text editing (bold, italic, links, lists) inside the callout
- Type selector and remove button rendered directly in callout DOM
- Serializes to GitHub-flavored alert syntax: `> [!NOTE]\n> content`
- Add `editorPlugins` to `ScriboPlugin` interface for React plugin components
- Add `exportDOM`/`importDOM` for copy/paste support
