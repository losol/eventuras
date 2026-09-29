---
'@eventuras/google-api': patch
'@eventuras/mailer': patch
'@eventuras/markdown-plugin-happening': patch
'@eventuras/scribo': patch
'@eventuras/shipper': patch
'@eventuras/smartform': patch
---

Ship type declarations again. `@eventuras/vite-config` 0.4.0 builds JavaScript only, so each package now runs `tsc --emitDeclarationOnly` after `vite build`. Test and story files stay out of the emitted types.
