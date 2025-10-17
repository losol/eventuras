# Logger Migration Guide

This document shows all the files that need to be migrated from the old Logger API to the new scoped logger pattern.

## Files to Update

### 1. ✅ AddUserToEvent.tsx
**Status:** COMPLETED
**Namespace:** `AddUserToEvent`

### 2. EventNotificator.tsx
**File:** `apps/web/src/components/event/EventNotificator.tsx`
**Namespace:** `EventNotificator`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'EventNotificator' });`
- Replace: `Logger.error({ namespace: 'EventNotificator' }, ...)` → `logger.error(...)`

### 3. middleware.ts
**File:** `apps/web/src/middleware.ts`
**Namespace:** `Middleware`
**Changes:**
- Create logger at top of `middleware()` function: `const logger = Logger.create({ namespace: 'Middleware' });`
- Has 3 log calls to migrate

### 4. api/session/route.ts
**File:** `apps/web/src/app/api/session/route.ts`
**Namespace:** `SessionAPI`
**Changes:**
- Create logger in each handler function
- Has multiple `namespace: 'session:route'` and `namespace: 'eventuras:middleware'` calls
- **Suggestion:** Use namespace `SessionAPI` for consistency

### 5. api/login/auth0/callback/route.ts
**File:** `apps/web/src/app/api/login/auth0/callback/route.ts`
**Namespace:** `Auth0Login`
**Changes:**
- Create logger at top of GET handler: `const logger = Logger.create({ namespace: 'Auth0Login' });`
- Has 5 log calls to migrate

### 6. EventEditor.tsx
**File:** `apps/web/src/app/admin/events/EventEditor.tsx`
**Namespace:** `EventEditor`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'EventEditor' });`
- Replace 3 log calls
- **Note:** One call uses `namespace: 'eventeditor'` (lowercase), suggest using `EventEditor` for consistency

### 7. admin/events/[id]/page.tsx
**File:** `apps/web/src/app/admin/events/[id]/page.tsx`
**Namespace:** `EventAdminPage`
**Changes:**
- Create logger at top of component function
- Has 4 log calls to migrate
- **Note:** Uses `namespace: 'EditEventinfo'` and `namespace: 'EventAdminPage'`
- **Suggestion:** Use single namespace `EventAdminPage`

### 8. admin/events/actions.ts
**File:** `apps/web/src/app/admin/events/actions.ts`
**Namespace:** `EventActions`
**Changes:**
- Create logger at top of each action function
- Has 3 log calls to migrate
- **Note:** Uses `namespace: 'eventcreator'` and `namespace: 'admin:events'`
- **Suggestion:** Use single namespace `EventActions`

### 9. UserEditor.tsx
**File:** `apps/web/src/app/admin/users/UserEditor.tsx`
**Namespace:** `UserEditor`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'UserEditor' });`
- Has 6 log calls to migrate
- **Note:** Currently uses a variable `log_namespace`
- **Suggestion:** Replace with scoped logger

### 10. ProductModal.tsx
**File:** `apps/web/src/app/admin/events/[id]/products/ProductModal.tsx`
**Namespace:** `ProductEditor`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'ProductEditor' });`
- Has 2 log calls

### 11. OrderActionsMenu.tsx
**File:** `apps/web/src/app/admin/orders/OrderActionsMenu.tsx`
**Namespace:** `OrderActions`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'OrderActions' });`
- Has 4 log calls
- **Note:** Uses `namespace: 'invoicing:order'` and `namespace: 'invoicing:registration'`
- **Suggestion:** Use namespace `OrderActions` or keep split if they represent different concerns

### 12. OrganizationMemberships.tsx
**File:** `apps/web/src/app/admin/organizations/[id]/OrganizationMemberships.tsx`
**Namespace:** `OrganizationMemberships`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'OrganizationMemberships' });`
- Has 2 log calls

### 13. ExcelExportButton.tsx
**File:** `apps/web/src/app/admin/events/[id]/ExcelExportButton.tsx`
**Namespace:** `ExcelExporter`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'ExcelExporter' });`
- Has 1 log call

### 14. EventParticipantList.tsx
**File:** `apps/web/src/app/admin/events/EventParticipantList.tsx`
**Namespace:** `EventParticipantList`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'EventParticipantList' });`
- Has 1 log call
- **Note:** Currently uses `namespace: 'admin:eventparticipantlist'`

### 15. Registration.tsx
**File:** `apps/web/src/app/admin/registrations/Registration.tsx`
**Namespace:** `RegistrationEditor`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'RegistrationEditor' });`
- Has 1 log call
- **Note:** Currently uses a variable `logger_namespace`

### 16. actions.ts (registrations)
**File:** `apps/web/src/app/admin/registrations/actions.ts`
**Namespace:** `RegistrationCache`
**Changes:**
- Create logger at top of function
- Has 1 log call
- **Note:** Uses `namespace: 'cache'`
- **Suggestion:** Use `RegistrationCache` for clarity

### 17. EditRegistrationProductsDialog.tsx
**File:** `apps/web/src/components/eventuras/EditRegistrationProductsDialog.tsx`
**Namespace:** `EditRegistrationProducts`
**Changes:**
- Add at component level: `const logger = Logger.create({ namespace: 'EditRegistrationProducts' });`
- Has 2 log calls
- **Note:** Currently uses `namespace: 'editregistration'`

### 18. getSiteSettings.ts
**File:** `apps/web/src/utils/site/getSiteSettings.ts`
**Namespace:** `SiteSettings`
**Changes:**
- Create logger at top of function
- Has 1 log call
- **Note:** Currently uses `namespace: 'sitesettings'`

### 19. events.ts (utils)
**File:** `apps/web/src/utils/api/functions/events.ts`
**Namespace:** `EventRegistrationAPI`
**Changes:**
- Create logger at top of function
- Has 1 log call
- **Note:** Currently uses `namespace: 'events:createEventRegistration'`

### 20. page.tsx (events static params)
**File:** `apps/web/src/app/events/[id]/[slug]/page.tsx`
**Namespace:** `EventStaticParams`
**Changes:**
- Create logger at top of function
- Has 2 log calls
- **Note:** Currently uses `namespace: 'events:staticparams'`

### 21. page.tsx (collections static params)
**File:** `apps/web/src/app/collections/[id]/[slug]/page.tsx`
**Namespace:** `CollectionStaticParams`
**Changes:**
- Create logger at top of function
- Has 1 log call
- **Note:** Currently uses `namespace: 'collections:staticparams'`

### 22. Test files (playwright)
**Files:** 
- `apps/web-e2e/playwright-e2e/functions.ts`
- `apps/web-e2e/playwright-e2e/utils.ts`

**Namespaces:** `PlaywrightAuth`, `PlaywrightUtils`
**Changes:**
- Create scoped loggers in test utilities

## Pattern Summary

### Old Pattern
```typescript
Logger.info({ namespace: 'ComponentName' }, 'Message');
Logger.error({ namespace: 'ComponentName' }, error);
```

### New Pattern
```typescript
// At component/function level
const logger = Logger.create({ namespace: 'ComponentName' });

// Then use throughout
logger.info('Message');
logger.error({ error }, 'Error message');
```

## Would you like me to:
1. Update all files automatically? (I can do this)
2. Update them one by one so you can review?
3. Just provide the code snippets for specific files?

Let me know your preference!
