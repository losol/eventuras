---
"@eventuras/shipper": patch
---

Replace the oclif-based `oxo-cli` with runnable `tsx` scripts in `libs/shipper` (`shipment:create`, `label:download`). The label download script now validates that the label URL is HTTPS and points to a Bring API host before attaching API credentials.
