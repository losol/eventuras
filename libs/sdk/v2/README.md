# eventuras-sdk-v2

Developer-friendly & type-safe Typescript SDK specifically catered to leverage *eventuras-sdk-v2* API.

<div align="left">
    <a href="https://www.speakeasy.com/?utm_source=eventuras-sdk-v2&utm_campaign=typescript"><img src="https://custom-icon-badges.demolab.com/badge/-Built%20By%20Speakeasy-212015?style=for-the-badge&logoColor=FBE331&logo=speakeasy&labelColor=545454" /></a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-blue.svg" style="width: 100px; height: 28px;" />
    </a>
</div>


<br /><br />
> [!IMPORTANT]
> This SDK is not yet ready for production use. To complete setup please follow the steps outlined in your [workspace](https://app.speakeasy.com/org/eventuras/eventurasdev). Delete this section before > publishing to a package manager.

<!-- Start Summary [summary] -->
## Summary


<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [eventuras-sdk-v2](#eventuras-sdk-v2)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

> [!TIP]
> To finish publishing your SDK to npm and others you must [run your first generation action](https://www.speakeasy.com/docs/github-setup#step-by-step-guide).


The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add <UNSET>
```

### PNPM

```bash
pnpm add <UNSET>
```

### Bun

```bash
bun add <UNSET>
```

### Yarn

```bash
yarn add <UNSET> zod

# Note that Yarn does not install peer dependencies automatically. You will need
# to install zod as shown above.
```

> [!NOTE]
> This package is published with CommonJS and ES Modules (ESM) support.
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name     | Type | Scheme      | Environment Variable  |
| -------- | ---- | ----------- | --------------------- |
| `bearer` | http | HTTP Bearer | `EVENTURASSDK_BEARER` |

To authenticate with the API the `bearer` parameter must be set when initializing the SDK client instance. For example:
```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [certificates](docs/sdks/certificates/README.md)

* [getV3CertificatesId](docs/sdks/certificates/README.md#getv3certificatesid)

### [eventCertificates](docs/sdks/eventcertificates/README.md)

* [getV3EventIdCertificates](docs/sdks/eventcertificates/README.md#getv3eventidcertificates)
* [getV3EventIdCertificatesPreview](docs/sdks/eventcertificates/README.md#getv3eventidcertificatespreview)
* [postV3EventIdCertificatesIssue](docs/sdks/eventcertificates/README.md#postv3eventidcertificatesissue)
* [postV3EventIdCertificatesUpdate](docs/sdks/eventcertificates/README.md#postv3eventidcertificatesupdate)

### [eventCollection](docs/sdks/eventcollection/README.md)

* [getV3Eventcollections](docs/sdks/eventcollection/README.md#getv3eventcollections)
* [postV3Eventcollections](docs/sdks/eventcollection/README.md#postv3eventcollections)
* [getV3EventcollectionsId](docs/sdks/eventcollection/README.md#getv3eventcollectionsid)
* [putV3EventcollectionsId](docs/sdks/eventcollection/README.md#putv3eventcollectionsid)
* [deleteV3EventcollectionsId](docs/sdks/eventcollection/README.md#deletev3eventcollectionsid)

### [eventCollectionMapping](docs/sdks/eventcollectionmapping/README.md)

* [putV3EventsEventIdCollectionsCollectionId](docs/sdks/eventcollectionmapping/README.md#putv3eventseventidcollectionscollectionid)
* [deleteV3EventsEventIdCollectionsCollectionId](docs/sdks/eventcollectionmapping/README.md#deletev3eventseventidcollectionscollectionid)

### [eventProducts](docs/sdks/eventproducts/README.md)

* [getV3EventsEventIdProducts](docs/sdks/eventproducts/README.md#getv3eventseventidproducts)
* [postV3EventsEventIdProducts](docs/sdks/eventproducts/README.md#postv3eventseventidproducts)
* [putV3EventsEventIdProductsProductId](docs/sdks/eventproducts/README.md#putv3eventseventidproductsproductid)
* [deleteV3EventsEventIdProductsProductId](docs/sdks/eventproducts/README.md#deletev3eventseventidproductsproductid)

### [eventProductVariants](docs/sdks/eventproductvariants/README.md)

* [getV3EventsEventIdProductsProductIdVariants](docs/sdks/eventproductvariants/README.md#getv3eventseventidproductsproductidvariants)
* [postV3EventsEventIdProductsProductIdVariants](docs/sdks/eventproductvariants/README.md#postv3eventseventidproductsproductidvariants)
* [deleteV3EventsEventIdProductsProductIdVariantsId](docs/sdks/eventproductvariants/README.md#deletev3eventseventidproductsproductidvariantsid)

### [events](docs/sdks/events/README.md)

* [getV3Events](docs/sdks/events/README.md#getv3events) - Retrieves a list of events based on the given query.
* [postV3Events](docs/sdks/events/README.md#postv3events) - Creates a new event.
* [getV3EventsId](docs/sdks/events/README.md#getv3eventsid) - Retrieves event details by ID.
* [putV3EventsId](docs/sdks/events/README.md#putv3eventsid) - Updates an existing event by ID.
* [patchV3EventsId](docs/sdks/events/README.md#patchv3eventsid) - Partially updates a specific event by its ID using JSON Patch.
* [deleteV3EventsId](docs/sdks/events/README.md#deletev3eventsid) - Deletes an event by ID.

### [eventStatistics](docs/sdks/eventstatistics/README.md)

* [getV3EventsEventIdStatistics](docs/sdks/eventstatistics/README.md#getv3eventseventidstatistics) - Event statistics


### [invoices](docs/sdks/invoices/README.md)

* [getV3InvoicesId](docs/sdks/invoices/README.md#getv3invoicesid)
* [postV3Invoices](docs/sdks/invoices/README.md#postv3invoices)

### [notificationRecipients](docs/sdks/notificationrecipients/README.md)

* [getV3NotificationsIdRecipients](docs/sdks/notificationrecipients/README.md#getv3notificationsidrecipients)

### [notifications](docs/sdks/notifications/README.md)

* [getV3NotificationsId](docs/sdks/notifications/README.md#getv3notificationsid)
* [getV3Notifications](docs/sdks/notifications/README.md#getv3notifications)

### [notificationsQueueing](docs/sdks/notificationsqueueing/README.md)

* [postV3NotificationsEmail](docs/sdks/notificationsqueueing/README.md#postv3notificationsemail)
* [postV3NotificationsSms](docs/sdks/notificationsqueueing/README.md#postv3notificationssms)

### [onlineCourse](docs/sdks/onlinecourse/README.md)

* [getV3Onlinecourses](docs/sdks/onlinecourse/README.md#getv3onlinecourses)
* [getV3OnlinecoursesId](docs/sdks/onlinecourse/README.md#getv3onlinecoursesid)

### [orders](docs/sdks/orders/README.md)

* [getV3OrdersId](docs/sdks/orders/README.md#getv3ordersid)
* [patchV3OrdersId](docs/sdks/orders/README.md#patchv3ordersid)
* [putV3OrdersId](docs/sdks/orders/README.md#putv3ordersid)
* [deleteV3OrdersId](docs/sdks/orders/README.md#deletev3ordersid)
* [getV3Orders](docs/sdks/orders/README.md#getv3orders)
* [postV3Orders](docs/sdks/orders/README.md#postv3orders)

### [organizationMemberRoles](docs/sdks/organizationmemberroles/README.md)

* [getV3OrganizationsOrganizationIdMembersUserIdRoles](docs/sdks/organizationmemberroles/README.md#getv3organizationsorganizationidmembersuseridroles)
* [postV3OrganizationsOrganizationIdMembersUserIdRoles](docs/sdks/organizationmemberroles/README.md#postv3organizationsorganizationidmembersuseridroles)
* [deleteV3OrganizationsOrganizationIdMembersUserIdRoles](docs/sdks/organizationmemberroles/README.md#deletev3organizationsorganizationidmembersuseridroles)

### [organizationMembers](docs/sdks/organizationmembers/README.md)

* [putV3OrganizationsOrganizationIdMembersUserId](docs/sdks/organizationmembers/README.md#putv3organizationsorganizationidmembersuserid)
* [deleteV3OrganizationsOrganizationIdMembersUserId](docs/sdks/organizationmembers/README.md#deletev3organizationsorganizationidmembersuserid)

### [organizations](docs/sdks/organizations/README.md)

* [getV3Organizations](docs/sdks/organizations/README.md#getv3organizations)
* [postV3Organizations](docs/sdks/organizations/README.md#postv3organizations)
* [getV3OrganizationsOrganizationId](docs/sdks/organizations/README.md#getv3organizationsorganizationid)
* [putV3OrganizationsOrganizationId](docs/sdks/organizations/README.md#putv3organizationsorganizationid)
* [deleteV3OrganizationsOrganizationId](docs/sdks/organizations/README.md#deletev3organizationsorganizationid)

### [organizationSettings](docs/sdks/organizationsettings/README.md)

* [getV3OrganizationsOrganizationIdSettings](docs/sdks/organizationsettings/README.md#getv3organizationsorganizationidsettings)
* [putV3OrganizationsOrganizationIdSettings](docs/sdks/organizationsettings/README.md#putv3organizationsorganizationidsettings)
* [postV3OrganizationsOrganizationIdSettings](docs/sdks/organizationsettings/README.md#postv3organizationsorganizationidsettings)

### [products](docs/sdks/products/README.md)

* [getV3ProductsProductIdSummary](docs/sdks/products/README.md#getv3productsproductidsummary)

### [registrationCertificate](docs/sdks/registrationcertificate/README.md)

* [postV3RegistrationsIdCertificateSend](docs/sdks/registrationcertificate/README.md#postv3registrationsidcertificatesend)

### [registrationOrders](docs/sdks/registrationorders/README.md)

* [getV3RegistrationsIdOrders](docs/sdks/registrationorders/README.md#getv3registrationsidorders)
* [postV3RegistrationsIdOrders](docs/sdks/registrationorders/README.md#postv3registrationsidorders)
* [postV3RegistrationsIdProducts](docs/sdks/registrationorders/README.md#postv3registrationsidproducts)

### [registrations](docs/sdks/registrations/README.md)

* [getV3Registrations](docs/sdks/registrations/README.md#getv3registrations) - Get registrations with optional Excel export
* [postV3Registrations](docs/sdks/registrations/README.md#postv3registrations)
* [getV3RegistrationsId](docs/sdks/registrations/README.md#getv3registrationsid)
* [putV3RegistrationsId](docs/sdks/registrations/README.md#putv3registrationsid)
* [patchV3RegistrationsId](docs/sdks/registrations/README.md#patchv3registrationsid)
* [deleteV3RegistrationsId](docs/sdks/registrations/README.md#deletev3registrationsid)
* [postV3RegistrationsMeEventId](docs/sdks/registrations/README.md#postv3registrationsmeeventid) - Alias for POST /v3/registrations

### [userProfile](docs/sdks/userprofile/README.md)

* [getV3Userprofile](docs/sdks/userprofile/README.md#getv3userprofile) - Gets information about the current user. Creates a new user if no user with the email exists.
* [putV3Userprofile](docs/sdks/userprofile/README.md#putv3userprofile)

### [users](docs/sdks/users/README.md)

* [~~getV3UsersMe~~](docs/sdks/users/README.md#getv3usersme) - Gets information about the current user. Creates a new user if no user with the email exists. :warning: **Deprecated**
* [getV3UsersId](docs/sdks/users/README.md#getv3usersid)
* [putV3UsersId](docs/sdks/users/README.md#putv3usersid)
* [getV3Users](docs/sdks/users/README.md#getv3users)
* [postV3Users](docs/sdks/users/README.md#postv3users)

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`certificatesGetV3CertificatesId`](docs/sdks/certificates/README.md#getv3certificatesid)
- [`eventCertificatesGetV3EventIdCertificates`](docs/sdks/eventcertificates/README.md#getv3eventidcertificates)
- [`eventCertificatesGetV3EventIdCertificatesPreview`](docs/sdks/eventcertificates/README.md#getv3eventidcertificatespreview)
- [`eventCertificatesPostV3EventIdCertificatesIssue`](docs/sdks/eventcertificates/README.md#postv3eventidcertificatesissue)
- [`eventCertificatesPostV3EventIdCertificatesUpdate`](docs/sdks/eventcertificates/README.md#postv3eventidcertificatesupdate)
- [`eventCollectionDeleteV3EventcollectionsId`](docs/sdks/eventcollection/README.md#deletev3eventcollectionsid)
- [`eventCollectionGetV3Eventcollections`](docs/sdks/eventcollection/README.md#getv3eventcollections)
- [`eventCollectionGetV3EventcollectionsId`](docs/sdks/eventcollection/README.md#getv3eventcollectionsid)
- [`eventCollectionMappingDeleteV3EventsEventIdCollectionsCollectionId`](docs/sdks/eventcollectionmapping/README.md#deletev3eventseventidcollectionscollectionid)
- [`eventCollectionMappingPutV3EventsEventIdCollectionsCollectionId`](docs/sdks/eventcollectionmapping/README.md#putv3eventseventidcollectionscollectionid)
- [`eventCollectionPostV3Eventcollections`](docs/sdks/eventcollection/README.md#postv3eventcollections)
- [`eventCollectionPutV3EventcollectionsId`](docs/sdks/eventcollection/README.md#putv3eventcollectionsid)
- [`eventProductsDeleteV3EventsEventIdProductsProductId`](docs/sdks/eventproducts/README.md#deletev3eventseventidproductsproductid)
- [`eventProductsGetV3EventsEventIdProducts`](docs/sdks/eventproducts/README.md#getv3eventseventidproducts)
- [`eventProductsPostV3EventsEventIdProducts`](docs/sdks/eventproducts/README.md#postv3eventseventidproducts)
- [`eventProductsPutV3EventsEventIdProductsProductId`](docs/sdks/eventproducts/README.md#putv3eventseventidproductsproductid)
- [`eventProductVariantsDeleteV3EventsEventIdProductsProductIdVariantsId`](docs/sdks/eventproductvariants/README.md#deletev3eventseventidproductsproductidvariantsid)
- [`eventProductVariantsGetV3EventsEventIdProductsProductIdVariants`](docs/sdks/eventproductvariants/README.md#getv3eventseventidproductsproductidvariants)
- [`eventProductVariantsPostV3EventsEventIdProductsProductIdVariants`](docs/sdks/eventproductvariants/README.md#postv3eventseventidproductsproductidvariants)
- [`eventsDeleteV3EventsId`](docs/sdks/events/README.md#deletev3eventsid) - Deletes an event by ID.
- [`eventsGetV3Events`](docs/sdks/events/README.md#getv3events) - Retrieves a list of events based on the given query.
- [`eventsGetV3EventsId`](docs/sdks/events/README.md#getv3eventsid) - Retrieves event details by ID.
- [`eventsPatchV3EventsId`](docs/sdks/events/README.md#patchv3eventsid) - Partially updates a specific event by its ID using JSON Patch.
- [`eventsPostV3Events`](docs/sdks/events/README.md#postv3events) - Creates a new event.
- [`eventsPutV3EventsId`](docs/sdks/events/README.md#putv3eventsid) - Updates an existing event by ID.
- [`eventStatisticsGetV3EventsEventIdStatistics`](docs/sdks/eventstatistics/README.md#getv3eventseventidstatistics) - Event statistics
- [`invoicesGetV3InvoicesId`](docs/sdks/invoices/README.md#getv3invoicesid)
- [`invoicesPostV3Invoices`](docs/sdks/invoices/README.md#postv3invoices)
- [`notificationRecipientsGetV3NotificationsIdRecipients`](docs/sdks/notificationrecipients/README.md#getv3notificationsidrecipients)
- [`notificationsGetV3Notifications`](docs/sdks/notifications/README.md#getv3notifications)
- [`notificationsGetV3NotificationsId`](docs/sdks/notifications/README.md#getv3notificationsid)
- [`notificationsQueueingPostV3NotificationsEmail`](docs/sdks/notificationsqueueing/README.md#postv3notificationsemail)
- [`notificationsQueueingPostV3NotificationsSms`](docs/sdks/notificationsqueueing/README.md#postv3notificationssms)
- [`onlineCourseGetV3Onlinecourses`](docs/sdks/onlinecourse/README.md#getv3onlinecourses)
- [`onlineCourseGetV3OnlinecoursesId`](docs/sdks/onlinecourse/README.md#getv3onlinecoursesid)
- [`ordersDeleteV3OrdersId`](docs/sdks/orders/README.md#deletev3ordersid)
- [`ordersGetV3Orders`](docs/sdks/orders/README.md#getv3orders)
- [`ordersGetV3OrdersId`](docs/sdks/orders/README.md#getv3ordersid)
- [`ordersPatchV3OrdersId`](docs/sdks/orders/README.md#patchv3ordersid)
- [`ordersPostV3Orders`](docs/sdks/orders/README.md#postv3orders)
- [`ordersPutV3OrdersId`](docs/sdks/orders/README.md#putv3ordersid)
- [`organizationMemberRolesDeleteV3OrganizationsOrganizationIdMembersUserIdRoles`](docs/sdks/organizationmemberroles/README.md#deletev3organizationsorganizationidmembersuseridroles)
- [`organizationMemberRolesGetV3OrganizationsOrganizationIdMembersUserIdRoles`](docs/sdks/organizationmemberroles/README.md#getv3organizationsorganizationidmembersuseridroles)
- [`organizationMemberRolesPostV3OrganizationsOrganizationIdMembersUserIdRoles`](docs/sdks/organizationmemberroles/README.md#postv3organizationsorganizationidmembersuseridroles)
- [`organizationMembersDeleteV3OrganizationsOrganizationIdMembersUserId`](docs/sdks/organizationmembers/README.md#deletev3organizationsorganizationidmembersuserid)
- [`organizationMembersPutV3OrganizationsOrganizationIdMembersUserId`](docs/sdks/organizationmembers/README.md#putv3organizationsorganizationidmembersuserid)
- [`organizationsDeleteV3OrganizationsOrganizationId`](docs/sdks/organizations/README.md#deletev3organizationsorganizationid)
- [`organizationSettingsGetV3OrganizationsOrganizationIdSettings`](docs/sdks/organizationsettings/README.md#getv3organizationsorganizationidsettings)
- [`organizationSettingsPostV3OrganizationsOrganizationIdSettings`](docs/sdks/organizationsettings/README.md#postv3organizationsorganizationidsettings)
- [`organizationSettingsPutV3OrganizationsOrganizationIdSettings`](docs/sdks/organizationsettings/README.md#putv3organizationsorganizationidsettings)
- [`organizationsGetV3Organizations`](docs/sdks/organizations/README.md#getv3organizations)
- [`organizationsGetV3OrganizationsOrganizationId`](docs/sdks/organizations/README.md#getv3organizationsorganizationid)
- [`organizationsPostV3Organizations`](docs/sdks/organizations/README.md#postv3organizations)
- [`organizationsPutV3OrganizationsOrganizationId`](docs/sdks/organizations/README.md#putv3organizationsorganizationid)
- [`productsGetV3ProductsProductIdSummary`](docs/sdks/products/README.md#getv3productsproductidsummary)
- [`registrationCertificatePostV3RegistrationsIdCertificateSend`](docs/sdks/registrationcertificate/README.md#postv3registrationsidcertificatesend)
- [`registrationOrdersGetV3RegistrationsIdOrders`](docs/sdks/registrationorders/README.md#getv3registrationsidorders)
- [`registrationOrdersPostV3RegistrationsIdOrders`](docs/sdks/registrationorders/README.md#postv3registrationsidorders)
- [`registrationOrdersPostV3RegistrationsIdProducts`](docs/sdks/registrationorders/README.md#postv3registrationsidproducts)
- [`registrationsDeleteV3RegistrationsId`](docs/sdks/registrations/README.md#deletev3registrationsid)
- [`registrationsGetV3Registrations`](docs/sdks/registrations/README.md#getv3registrations) - Get registrations with optional Excel export
- [`registrationsGetV3RegistrationsId`](docs/sdks/registrations/README.md#getv3registrationsid)
- [`registrationsPatchV3RegistrationsId`](docs/sdks/registrations/README.md#patchv3registrationsid)
- [`registrationsPostV3Registrations`](docs/sdks/registrations/README.md#postv3registrations)
- [`registrationsPostV3RegistrationsMeEventId`](docs/sdks/registrations/README.md#postv3registrationsmeeventid) - Alias for POST /v3/registrations
- [`registrationsPutV3RegistrationsId`](docs/sdks/registrations/README.md#putv3registrationsid)
- [`userProfileGetV3Userprofile`](docs/sdks/userprofile/README.md#getv3userprofile) - Gets information about the current user. Creates a new user if no user with the email exists.
- [`userProfilePutV3Userprofile`](docs/sdks/userprofile/README.md#putv3userprofile)
- [`usersGetV3Users`](docs/sdks/users/README.md#getv3users)
- [`usersGetV3UsersId`](docs/sdks/users/README.md#getv3usersid)
- [`usersPostV3Users`](docs/sdks/users/README.md#postv3users)
- [`usersPutV3UsersId`](docs/sdks/users/README.md#putv3usersid)
- ~~[`usersGetV3UsersMe`](docs/sdks/users/README.md#getv3usersme)~~ - Gets information about the current user. Creates a new user if no user with the email exists. :warning: **Deprecated**

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  }, {
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

If the request fails due to, for example 4XX or 5XX status codes, it will throw a `APIError`.

| Error Type      | Status Code | Content Type |
| --------------- | ----------- | ------------ |
| errors.APIError | 4XX, 5XX    | \*/\*        |

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";
import { SDKValidationError } from "eventuras-sdk-v2/models/errors";

const eventurasSDK = new EventurasSDK({
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  let result;
  try {
    result = await eventurasSDK.certificates.getV3CertificatesId({
      id: 62194,
    });

    // Handle the result
    console.log(result);
  } catch (err) {
    switch (true) {
      // The server response does not match the expected SDK schema
      case (err instanceof SDKValidationError):
        {
          // Pretty-print will provide a human-readable multi-line error message
          console.error(err.pretty());
          // Raw value may also be inspected
          console.error(err.rawValue);
          return;
        }
        apierror.js;
      // Server returned an error status code or an unknown content type
      case (err instanceof APIError): {
        console.error(err.statusCode);
        console.error(err.rawResponse.body);
        return;
      }
      default: {
        // Other errors such as network errors, see HTTPClientErrors for more details
        throw err;
      }
    }
  }
}

run();

```

Validation errors can also occur when either method arguments or data returned from the server do not match the expected format. The `SDKValidationError` that is thrown as a result will capture the raw value that failed validation in an attribute called `rawValue`. Additionally, a `pretty()` method is available on this error that can be used to log a nicely formatted multi-line string since validation errors can list many issues and the plain error string may be difficult read when debugging.

In some rare cases, the SDK can fail to get a response from the server or even make the request due to unexpected circumstances such as network conditions. These types of errors are captured in the `models/errors/httpclienterrors.ts` module:

| HTTP Client Error                                    | Description                                          |
| ---------------------------------------------------- | ---------------------------------------------------- |
| RequestAbortedError                                  | HTTP request was aborted by the client               |
| RequestTimeoutError                                  | HTTP request timed out due to an AbortSignal signal  |
| ConnectionError                                      | HTTP client was unable to make a request to a server |
| InvalidRequestError                                  | Any input used to create a request is invalid        |
| UnexpectedClientError                                | Unrecognised or unexpected error                     |
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Override Server URL Per-Client

The default server can also be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const eventurasSDK = new EventurasSDK({
  serverURL: "http://localhost:8080",
  bearer: process.env["EVENTURASSDK_BEARER"] ?? "",
});

async function run() {
  const result = await eventurasSDK.certificates.getV3CertificatesId({
    id: 62194,
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to to add a
custom header and a timeout to requests and how to use the `"requestError"` hook
to log errors:

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";
import { HTTPClient } from "eventuras-sdk-v2/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new EventurasSDK({ httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { EventurasSDK } from "eventuras-sdk-v2";

const sdk = new EventurasSDK({ debugLogger: console });
```

You can also enable a default debug logger by setting an environment variable `EVENTURASSDK_DEBUG` to true.
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. 
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release. 

### SDK Created by [Speakeasy](https://www.speakeasy.com/?utm_source=eventuras-sdk-v2&utm_campaign=typescript)
