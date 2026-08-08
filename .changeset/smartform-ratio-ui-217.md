---
'@eventuras/smartform': patch
---

Pass only the current field's error to ratio-ui's TextField in the shape its 2.17 typed `errors` prop expects, instead of react-hook-form's whole `FieldErrors` object
