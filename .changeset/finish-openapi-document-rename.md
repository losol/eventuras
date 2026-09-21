---
'@eventuras/api': patch
---

Finishes renaming the OpenAPI document to `eventuras_v3.json`. Three references were missed, because the search that found the others filtered on file extensions and `Dockerfile` has none.

`tests/e2e/Dockerfile` copied the old path, which broke the end-to-end image build for anything touching `tests/e2e`. `apps/api/docs/.gitignore` un-ignored the old name, so the committed document was only tracked because it was already added.

The third was `OpenApiSpec_DiffCheck`, a test that compared the committed document against the generated one. It looked for the old filename, found nothing and returned early — but it could never have failed anyway: on a difference it wrote a warning to the console and asserted nothing. It is removed rather than repaired, since CI now verifies the committed document for real by rebuilding it and failing on a dirty working tree.
