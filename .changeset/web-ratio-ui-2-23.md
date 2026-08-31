---
'@eventuras/web': patch
'@eventuras/smartform': patch
---

Update to ratio-ui 2.23, which fixes the account menu dragging the sticky header out of the viewport: its popover was modal, and React Aria locks scrolling for modal overlays by setting `overflow: hidden` on the root element, which leaves `position: sticky` without a scrollport. Opening the menu on a scrolled page dropped the navbar and the section nav to the top of the document and took the open menu with them.
