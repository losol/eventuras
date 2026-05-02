# @eventuras/scribo

## 0.10.3

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

## 0.10.2

### Patch Changes

- 7c9fe79: chore: update dependencies

## 0.10.1

### Patch Changes

- e073558: Rename component exports that shadow built-in globals (Error → ErrorBlock/FieldError, Number → NumberField), remove identical sub-expressions in Link, and fix duplicate CSS properties with missing font fallback

## 0.10.0

### Minor Changes

- ed973fc: ### Callout plugin
  - Add `@eventuras/scribo/plugins/callout` — callout blocks with rich text content (NOTE, TIP, IMPORTANT, WARNING, CAUTION)
  - CalloutNode is an ElementNode — supports full rich text editing (bold, italic, links, lists) inside the callout
  - Type selector and remove button rendered directly in callout DOM
  - Serializes to GitHub-flavored alert syntax: `> [!NOTE]\n> content`
  - Add `editorPlugins` to `ScriboPlugin` interface for React plugin components
  - Add `exportDOM`/`importDOM` for copy/paste support

### Patch Changes

- ed973fc: ### Bug fixes
  - Fix `JSX.Element` → `ReactElement` in DecoratorNode types for valid TypeScript declarations
  - Add `importDOM` to `ScheduleItemNode` for copy/paste support

## 0.9.0

### Minor Changes

- e981f9d: ### Plugin system
  - Add `ScriboPlugin` interface for extending the editor with custom nodes, transformers, and toolbar buttons
  - `MarkdownEditor` and `MarkdownInput` accept a `plugins` prop
  - Plugin toolbar buttons render as dedicated buttons in the toolbar (not in the dropdown)
  - Export `ScriboPlugin` and `ScriboToolbarButton` types

  ### Schedule plugin
  - Add `@eventuras/scribo/plugins/schedule` — opt-in plugin for structured schedule/program editing
  - Schedule items render as inline-editable rows with time, title, speaker, and description fields
  - Serializes to `- **09:00–10:00** Title | Speaker | Description` markdown (compatible with remarkSchedule)

## 0.8.4

### Patch Changes

- e6d002d: ### Fix: Event description 300 character limit validation (#690)
  - Validate markdown length (not plain text) in MarkdownInput, since markdown is what gets stored
  - Block form submission via react-hook-form when description exceeds 300 characters
  - Add `[StringLength(300)]` to API EventFormDto for a clear 400 response instead of 500
  - Migrate scribo eslint config to flat config format

## 0.8.3

### Patch Changes

- 4a6097f: Enhanced dark mode support across UI components.

## 0.8.2

### Patch Changes

- chore: update deps

## 0.8.1

### Patch Changes

- chore: update dependencies across frontend packages

## 0.8.0

### Minor Changes

### 🧱 Features

- feat(scribo): auto heigh expanding (6ca2322) [@eventuras/scribo]

### 🐞 Bug Fixes

- fix(scribo): import MarkdownEditor.css for styling (d1eec7a) [@eventuras/scribo]
- fix(scribo): disable swc in scribo (ebce6db) [@eventuras/scribo]

### ♻️ Refactoring

- refactor(scribo): merge markdowninput into scribo with flexible styling (373587e) [@eventuras/scribo]

### 🧹 Maintenance

- chore(scribo): externalize Lexical packages in build configuration (7c7caaf) [@eventuras/scribo]
- chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/scribo]

### ⚙️ CI/CD

- ci(scribo): implement automated release workflow for Scribo (36d6ba1) [@eventuras/scribo]

## 0.7.1

### Patch Changes

- - chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (51e931b) [@eventuras/scribo]

## 0.7.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(scribo): upgrade lexical (f78dfa1)
  - chore(scribo): update packages (3475e0f)
  - feat(scribo): use readme as default content of editor page (428fc2b)
  - fix(scribo): add dependency (101954b)
  - feat(scribo): cache npm files for scribo build (a065b61)
  - feat(scribo): add undo/redo to markdown editor (b2482cc)
  - feat(scribo): adds links and link editing to editor (afe159d)
  - feat(scribo): set up scribo demo site (a467bc2)
