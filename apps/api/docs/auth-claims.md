# Authentication claim mapping

How the API turns an incoming OIDC token into an authenticated principal, and
what the identity provider (Auth0 or Keycloak) must emit for it to work.

## Claim → usage

| Concern | Claim read | Mechanism |
| --- | --- | --- |
| Roles (authorization) | `Auth:RoleClaimType` (e.g. `roles` for Keycloak; defaults to the .NET `ClaimTypes.Role` URI) | Configured on the JWT bearer in [`JwtBearerConfiguration`](../src/Eventuras.WebApi/Auth/JwtBearerConfiguration.cs); drives `IsInRole`, `[Authorize(Roles=…)]`, `IsSystemAdmin()`, `IsAdmin()` |
| Email | `ClaimTypes.Email` or raw `email` | [`ClaimsPrincipalExtensions.GetEmail()`](../src/Eventuras.Services/Auth/ClaimsPrincipalExtensions.cs) supports both mapped and raw JWT claims |
| Name | `ClaimTypes.Name` or raw `name` | [`ClaimsPrincipalExtensions.GetName()`](../src/Eventuras.Services/Auth/ClaimsPrincipalExtensions.cs) supports both mapped and raw JWT claims |
| Scopes | `scope` (space-delimited) | [`RequireScopeHandler`](../src/Eventuras.WebApi/Auth/RequireScopeHandler.cs); the claim's `Issuer` must equal `Auth:Issuer` |
| DB user id | `ClaimTypes.NameIdentifier` on the `Eventuras.Database` identity | Added by [`DbUserClaimTransformation`](../src/Eventuras.WebApi/DbUserClaimTransformation.cs) after resolving the DB user |
| Org-member roles | `ClaimTypes.Role` on the `Eventuras.Database` identity | Added by `DbUserClaimTransformation` for the **current** organization only |

When `Auth:RoleClaimType` is blank, JWT bearer keeps the framework default
inbound claim mapping for compatibility with existing Auth0 tokens. When
`Auth:RoleClaimType` is set (for example to `roles`), inbound mapping is disabled
so the raw JWT claim name remains available to `IsInRole` and
`[Authorize(Roles=…)]`. `GetRoles()` reads roles per identity using each
identity's `RoleClaimType`, so it stays correct regardless of `Auth:RoleClaimType`.

## What the IdP must emit

- **Roles**: a top-level `roles` claim. Keycloak places client roles under
  `resource_access.{client}.roles` by default — neither the API nor the web app
  reads that shape, so a "User Client Role" protocol mapper must flatten roles
  into a flat `roles` claim. It must be added to **both** tokens:
  - the **access token** (consumed by this API), and
  - the **ID token** (consumed by the web session — `fides-auth` decodes the
    `id_token`).
- **Email**: the `email` scope/mapper (Keycloak emits this by default). Email is
  currently the join key between the IdP identity and the DB user
  (`GetUserByEmailAsync`).
- **Issuer**: the token `iss` must exactly equal `Auth:Issuer` (used for both
  issuer validation and the scope-claim filter).

## Known fragility / future work

The DB user is resolved by **email**, which is mutable — changing a user's email
in the IdP breaks the link. The robust fix is to key on the stable `sub` (store
it on `ApplicationUser` as an external-login mapping and resolve by `sub`,
backfilling by email on first login). Tracked separately; not required to run.
