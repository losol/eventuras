# Playwright rules (tests/e2e)

Run the suite against the local Aspire stack ("Local stack" in the root `AGENTS.md`). Starting the stack writes
`tests/e2e/.env` with the URLs, test accounts (`admin@example.com`, `orgadmin@example.com`) and OTP via Mailpit, so no
manual setup is needed. `tests/e2e/README.md` covers other environments (staging, OTP via Gmail).

## How the suite runs

- Serial: `workers: 1`, `fullyParallel: false`. Locale `en-GB`, timezone `Europe/Paris`, `baseURL` from `E2E_WEB_URL`.
- Setup projects in `specs/setup/` (healthcheck, then admin/user/systemadmin/orgadmin auth) save browser state to `tmp/auth/`.
  Tests reuse that state. Never log in inside a test.
- Projects: `web:admin`, `web:user`, `web:systemadmin`, `web:public`, `api`. Put a spec in the matching `specs/web/<scope>/` or `specs/api/` folder.
- Flows depend on each other on purpose. Files are numbered and run in order, `{number}-{scope}-{scenario}.spec.ts`
  (e.g. `001-admin-event-create-registration.spec.ts`). Created events are handed on via `tmp/state/createdEvent.json`.
  Pick the number that follows the data the test needs.
- Shared helpers live in `specs/shared/` (`api-helpers.ts`, `testEventData.ts`) and `utils/` (`personas.ts`, `otp/`).

## Writing tests

- Locators in this order: `getByRole`, `getByLabel`, `getByTestId`. Avoid CSS and XPath.
- Use web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`) and rely on auto-wait. No `waitForTimeout`.
- Give test data unique names (timestamp or uuid) so reruns against the same environment don't collide.
- Debug output: `Debug.create('e2e:<area>')` from `@eventuras/logger`, enabled with `DEBUG=e2e*`. Not `console.log`.
- API tests use the helpers in `specs/shared/api-helpers.ts` (see `specs/shared/API_TESTING.md`).

## Running

```bash
aspire ps                         # reuse a running Eventuras stack
aspire start --non-interactive && aspire wait web && aspire wait api   # otherwise start one

cd tests/e2e
pnpm test                         # everything
pnpm test specs/web/public        # one folder
pnpm test --project=api           # one project
pnpm test:ui                      # UI mode
```

When a test fails, check the server side too: `aspire logs api --search "<text>"`, `aspire logs web -n 100`,
and the mail in Mailpit.
