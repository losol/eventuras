---
'@eventuras/web': patch
---

Extract `RouteErrorView` and route `app/error.tsx` + `admin/error.tsx` through it. Refactor with a visual tweak: error-page actions now use `ratio-ui` `Button` + `Link` instead of hand-rolled tailwind buttons, so they match the rest of the app.
