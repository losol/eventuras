---
"@eventuras/scribo": minor
---

### Plugin system

- Add `ScriboPlugin` interface for extending the editor with custom nodes, transformers, and toolbar buttons
- `MarkdownEditor` and `MarkdownInput` accept a `plugins` prop
- Plugin toolbar buttons render as dedicated buttons in the toolbar (not in the dropdown)
- Export `ScriboPlugin` and `ScriboToolbarButton` types

### Schedule plugin

- Add `@eventuras/scribo/plugins/schedule` — opt-in plugin for structured schedule/program editing
- Schedule items render as inline-editable rows with time, title, speaker, and description fields
- Serializes to `- **09:00–10:00** Title | Speaker | Description` markdown (compatible with remarkSchedule)
