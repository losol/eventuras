---
'@eventuras/scribo': patch
---

Fix Lexical error #53 ("Can't replace root node") when importing markdown containing a GitHub callout (`> [!NOTE]` etc.).

`CalloutTransformer.replace` called `parentNode.replace(calloutNode)` on the import path, but `@lexical/markdown` passes the actual `RootNode` as `parentNode` during `$convertFromMarkdownString`, and `RootNode.replace` always throws. Use `parentNode.append` on the import path (mirroring Lexical's own `CODE` transformer) and keep `parentNode.replace` for the keyboard-shortcut path where `parentNode` is a `ParagraphNode`.

Also harden `MarkdownEditor`'s `editorState` initializer: catch parse failures and fall back to inserting the raw markdown as plain text instead of letting the throw propagate up through the React render and tear down the surrounding tree.
