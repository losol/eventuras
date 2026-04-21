---
"@eventuras/web": patch
---

fix(web): silence React 19 script-tag warning in InitTheme

`InitTheme` renders an inline `<script>` in `<head>` to set
`data-theme` before hydration (anti-FOUC pattern). React 19's dev
runtime flags bare `<script>` tags inside components because
client-rendered scripts don't execute — the warning fires even
though this one only reaches the client via SSR output and works
fine. Switches to `next/script` with `strategy="beforeInteractive"`:
same timing, no warning.
