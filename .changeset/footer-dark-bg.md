---
"@eventuras/ratio-ui": minor
---

`Footer`'s `dark` prop now flips the background as well as the text tone — sets `bg-primary-900` (Linseed deep) instead of just adding `surface-dark`. In dark mode the footer also picks up a thin `border-primary-700` top border so it reads as a separate block against the matching-tone page surface.

Light footer (default) is unchanged. Apps already passing `dark` will see a real dark surface instead of just dark-tone text on the previous overlay-press background.
