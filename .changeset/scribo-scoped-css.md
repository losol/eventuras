---
'@eventuras/scribo': patch
'@eventuras/web': patch
---

The markdown editor's stylesheet no longer styles bare `ul` and `pre` elements globally — the rules are scoped to the editor. Unscoped, they overrode the design system's list reset on any page that loaded the editor, which is why the admin sidebar grew bullet points and indentation on event pages.
