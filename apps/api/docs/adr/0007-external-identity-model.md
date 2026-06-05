# ADR-0007: External identity model and account linking

## Status

Draft

## Context

The web app and API are migrating from Auth0 to a self-hosted Keycloak (all
environments except kursinord-prod). The end state is **one IdP** (Keycloak),
which itself **brokers multiple upstream auth providers** (e.g. BankID/Vipps,
Google, username/password) with different assurance levels per login.

Today the API resolves the database user from the OIDC token by **email**
([`DbUserClaimTransformation`](../../src/Eventuras.WebApi/DbUserClaimTransformation.cs)
→ `GetUserByEmailAsync`). Email is a poor join key:

- It is **mutable** — changing it at the IdP breaks the link.
- It is **provider-recyclable** and only as trustworthy as the issuing provider.

ASP.NET Core Identity (and its `AspNetUserLogins` table) was removed in
[ADR-0002](0002-remove-aspnet-identity.md). `ApplicationUser` is now a plain
POCO with a `Guid Id` and **no external-login store** — there is nothing
built-in to reuse for identity linking.

Requirements clarified during design:

- We must support **multiple external identities per user** (potentially several
  per provider).
- **Account-linking is owned by the application**, not necessarily delegated to
  the IdP.
- Assurance varies **per login session** depending on which brokered provider
  was used.
- GDPR is not a complicating factor: any identity/claim data we store sits
  within the existing user data and erasure flow.

## Decision

> The linking **policy** (how a new identity attaches to an existing user) is the
> one point still open — see [Open questions](#open-questions). Everything else
> below is the proposed model.

### 1. Key on the stable subject, not email

Resolve the user from the OIDC `sub` (scoped by issuer `iss`), not email. Email,
phone and name become synced **profile attributes**, never join keys.

### 2. Introduce a `UserIdentity` table (1 User → N identities)

```
UserIdentity
  Id            Guid     PK
  UserId        Guid     FK → ApplicationUser (cascade delete)
  Issuer        string   // token "iss"
  Subject       string   // "sub" — stable per issuer
  Provider      string?  // "bankid" / "google" / ... from the idp claim, if known
  LinkMethod    enum     // AutoEmail | SelfService | Admin
  EmailVerified bool
  PhoneVerified bool?
  Acr           string?  // assurance of the most recent login
  CreatedAt     Instant
  LastSeenAt    Instant?
  UNIQUE (Issuer, Subject)
  INDEX  (UserId)
```

Unique `(Issuer, Subject)` guarantees an external identity maps to exactly one
user. `UserId` is indexed for "all identities of a user".

### 3. Resolution order

In `DbUserClaimTransformation`:

1. Look up `UserIdentity` by `(Issuer, Subject)`. If found → that user.
2. Else apply the **linking policy** (below).
3. Else the user is not provisioned (current behaviour — no auto-create).

### 4. Linking policy (proposed default)

| Method | Flow | ATO risk | Use |
| --- | --- | --- | --- |
| **Self-service** | An already-authenticated user explicitly adds a login and proves control of the new identity | Low | **Default** for ongoing multi-identity |
| **Auto by verified email** | First login with a matching email is linked automatically | **High** unless gated | Constrained convenience only |
| **Admin** | An admin links an identity to a user | Low, manual | Edge cases / support |

**Security — non-negotiable gate:** auto-linking by email is the classic
account-takeover footgun (a weakly-verifying provider can hand an attacker
someone else's account via a pre-verified email). Auto-link is permitted **only**
when `email_verified = true` **and** the issuer is trusted. The Auth0→Keycloak
email backfill is treated as a **bounded instance** of auto-link, limited to the
migration window.

Proposed default: **self-service linking** as the trusted path; auto-by-email
only as the gated migration bridge; admin for support.

### 5. Assurance is first-class

- **Per-identity, persisted:** `LinkMethod` + verification snapshot
  (`EmailVerified`, `PhoneVerified`), optionally `Acr`/`Provider` of the last login.
- **Per-session, live:** authorization and step-up decisions read `acr`/`amr`
  from the **current token**, never from stored state. Optionally persist a
  derived "highest assurance attained" / "has strong login" at the user level if
  we want to gate features.

### 6. Profile attributes

Email, phone and name are synced from claims (with `email_verified` /
`phone_number_verified`) but are never join keys. Note: Keycloak does **not**
emit `phone_number` by default, and .NET's default inbound mapping likely does
not populate `ClaimTypes.MobilePhone` from it — phone needs an explicit mapper
(tracked in [auth-claims.md](../auth-claims.md)).

### 7. GDPR / data lifecycle

`UserIdentity` rows (and any claim snapshot) cascade-delete with the user and are
included in the existing erasure/anonymization flow. No new compliance surface —
same data category already held on `ApplicationUser`.

## Consequences

**Positive**

- Stable identity that survives email changes and provider recycling.
- Native support for multiple identities / providers per user.
- App owns linking, so policy and assurance are explicit and auditable.
- Keying on `sub` avoids storing strong upstream identifiers (e.g. national IDs)
  that high-assurance providers expose.

**Negative / cost**

- New table, repository, and an EF migration.
- Account-linking is now an application concern with real security weight (the
  email gate above is mandatory).
- A self-service linking flow is additional UI/endpoint work (can come later).

## Alternatives considered

- **Single `SubjectId` column on `ApplicationUser`** — rejected: cannot hold
  multiple identities per user.
- **Reuse `AspNetUserLogins`** — unavailable: ASP.NET Identity was removed
  ([ADR-0002](0002-remove-aspnet-identity.md)).
- **Let Keycloak own all linking** (app sees one `sub` per human) — rejected as a
  hard assumption: we want the app to own linking and support multiple identities.

## Open questions

1. **Linking policy default** — self-service only, auto-by-verified-email, or
   both (and in which contexts)? This drives the rest of the implementation.
2. **Provisioning** — keep "user must pre-exist in DB", or auto-create on first
   verified login?
3. **Claim snapshot depth** — store a curated subset (email/phone/name + verified
   flags) only, or also a raw claims blob for audit?
4. **Assurance persistence** — keep assurance session-only (token `acr`), or
   persist a derived user-level "strong login" flag for feature gating?
5. **Multiple identities, same provider** — any constraints, or freely allowed?

## Rollout (once the policy is decided)

1. **Schema** — `UserIdentity` entity + EF migration + repository
   (`FindUserByExternalIdentityAsync`, `LinkExternalIdentityAsync`).
2. **Resolve-by-subject** — update `DbUserClaimTransformation` (subject lookup →
   gated email backfill), backward compatible with the email path during the
   transition.
3. **Self-service linking** — UI/endpoint to add an identity to an authenticated
   account (later).
