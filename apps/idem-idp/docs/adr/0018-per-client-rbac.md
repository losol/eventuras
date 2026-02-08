# ADR 0018 — Per-Client Role-Based Access Control

## Status

Accepted (Supersedes [ADR 0007](0007-admin-rbac.md))

## Context

ADR 0007 established a simplified single-tenant RBAC model with `systemRole` stored directly on the accounts table. While this approach works for basic admin access control, it has limitations:

1. **No per-client authorization**: All roles are global; cannot restrict access per OAuth client
2. **Limited flexibility**: Only two hardcoded roles (`system_admin`, `admin_reader`)
3. **Hardcoded admin client**: The `idem-admin` client is defined in code, not in the database
4. **No role assignment API**: Roles must be granted via direct database updates

As Idem evolves to support multiple OAuth clients with different access requirements, we need a more flexible RBAC model inspired by Casbin's RBAC with Domains pattern.

## Decision

Replace account-level `systemRole` with a per-client role assignment system where:

- **Domain = OAuth client_slug**: Each client can define its own roles
- **Role grants are explicit**: Users are granted roles for specific clients
- **idem-admin is a regular client**: Seeded in the database with `systemadmin` and `admin_reader` roles
- **Only systemadmin can assign roles**: Users with `systemadmin` role for the idem-admin client control all role assignments

### Database Schema

**Remove from accounts table:**

- `system_role` column

**New tables:**

```sql
-- Defines available roles for each OAuth client
CREATE TABLE idem.client_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_client_id UUID NOT NULL REFERENCES idem.oauth_clients(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(oauth_client_id, role_name)
);

-- Maps users to roles for specific clients (Casbin's g = user, role, domain)
CREATE TABLE idem.role_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES idem.accounts(id) ON DELETE CASCADE,
  client_role_id UUID NOT NULL REFERENCES idem.client_roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES idem.accounts(id) ON DELETE SET NULL,
  UNIQUE(account_id, client_role_id)
);

-- Indexes for common query patterns
CREATE INDEX role_grants_account_idx ON idem.role_grants(account_id);
CREATE INDEX client_roles_lookup_idx ON idem.client_roles(oauth_client_id, role_name);
```

### Token Claims

When a user authenticates with an OAuth client, their ID token includes roles for that specific client.

**Note:** The `aud` claim is always an array, even for single audiences. This ensures forward compatibility with [RFC 8707 (Resource Indicators)](https://datatracker.ietf.org/doc/html/rfc8707) which allows tokens to be issued for multiple resource servers.

```json
{
  "sub": "user-uuid",
  "aud": ["idem-admin"],
  "roles": ["systemadmin"],
  "email": "admin@example.com"
}
```

### Authorization Flow

```text
1. User authenticates via OAuth client (e.g., idem-admin)
2. Idem queries role_grants for user's roles in that client
3. Roles are included in ID token claims (empty array if no roles)
4. Client application checks roles claim for authorization
5. For idem-admin: requires "systemadmin" or "admin_reader" role
```

**Note on empty roles:** Users without any roles for a client will receive a token with an empty `roles` array. It is the client application's responsibility to handle authorization based on the roles claim. This allows users to authenticate without necessarily having access to all features.

### Admin Access Control

The idem-admin client has two predefined roles:

| Role           | Permissions                                                    |
| -------------- | -------------------------------------------------------------- |
| `systemadmin`  | Full read/write access to all resources; can assign roles to users |
| `admin_reader` | Read-only access to admin panel                                |

Only users with `systemadmin` role for the `idem-admin` client can:

- Create/modify/delete OAuth clients
- Assign roles to users for any client
- Manage accounts and IdP configurations

## Use Cases

This section illustrates how per-client roles work for different applications in the Eventuras ecosystem.

### idem-admin (Identity Provider Administration)

The admin console for managing Idem itself.

| Role           | Description                              | Permissions                          |
| -------------- | ---------------------------------------- | ------------------------------------ |
| `systemadmin`  | Full administrative access               | Manage clients, accounts, IdP config, assign roles for all clients |
| `admin_reader` | Read-only access for auditing            | View all resources, cannot modify, **no access to secrets** |

**Important:** `admin_reader` must never see sensitive data such as:

- Client secrets (only shown once at creation, never retrievable)
- JWKS private keys
- IdP broker credentials
- Any API keys or tokens

**Token example:**

```json
{
  "sub": "admin-uuid",
  "aud": ["idem-admin"],
  "roles": ["systemadmin"],
  "email": "admin@example.com"
}
```

### Argo CD (GitOps Deployments)

Continuous deployment platform for Kubernetes. Uses [Argo CD's built-in roles](https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv).

| Role       | Description                              | Permissions                          |
| ---------- | ---------------------------------------- | ------------------------------------ |
| `admin`    | Full Argo CD access (built-in)           | Manage applications, clusters, repositories, projects, accounts |
| `readonly` | Read-only access (built-in)              | View applications, clusters, logs, certificates |

**Token example:**

```json
{
  "sub": "developer-uuid",
  "aud": ["argo-cd"],
  "roles": ["readonly"],
  "email": "dev@example.com"
}
```

**Argo CD RBAC integration:** Argo CD can be configured to read the `roles` claim from the OIDC token and map it to its internal RBAC policies. See [Argo CD SSO documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/).

**Use case:** A developer with `readonly` can view deployment status and logs but cannot sync or modify applications unless granted `admin`.

### Grafana (Observability)

Monitoring and observability platform.

| Role     | Description                              | Permissions                          |
| -------- | ---------------------------------------- | ------------------------------------ |
| `admin`  | Full Grafana access                      | Manage dashboards, data sources, users |
| `editor` | Can create and modify dashboards         | Create/edit dashboards, explore data |
| `viewer` | Read-only access                         | View dashboards only                 |

**Token example:**

```json
{
  "sub": "ops-uuid",
  "aud": ["grafana"],
  "roles": ["editor"],
  "email": "ops@example.com"
}
```

### Historia (Content Management)

Headless CMS for content management.

| Role          | Description                              | Permissions                          |
| ------------- | ---------------------------------------- | ------------------------------------ |
| `admin`       | Full CMS access                          | Manage all content, users, settings  |
| `site_editor` | Can manage content for assigned sites    | Create/edit/publish content          |
| `contributor` | Can create content drafts                | Create drafts, cannot publish        |
| `viewer`      | Read-only access                         | View published content only          |

**Token example:**

```json
{
  "sub": "editor-uuid",
  "aud": ["historia"],
  "roles": ["site_editor"],
  "email": "editor@example.com"
}
```

### Eventuras API (Event Management Backend)

The C# backend for event management (future integration).

| Role        | Description                              | Permissions                          |
| ----------- | ---------------------------------------- | ------------------------------------ |
| `admin`     | Full API access                          | Manage all events, organizations, users |
| `organizer` | Can manage events for their organization | Create/edit events, manage registrations |
| `staff`     | Event staff access                       | Check-in attendees, view registrations |
| `member`    | Registered user                          | Register for events, view own data   |

**Token example:**

```json
{
  "sub": "organizer-uuid",
  "aud": ["eventuras-api"],
  "roles": ["organizer"],
  "email": "organizer@example.com"
}
```

### Cross-Client Role Matrix Example

A single user can have different roles across multiple clients:

| User  | idem-admin     | argo-cd    | grafana  | historia     | eventuras-api |
| ----- | -------------- | ---------- | -------- | ------------ | ------------- |
| Ole   | `systemadmin`  | `admin`    | `admin`  | `admin`      | `admin`       |
| Kari  | -              | `admin`    | `editor` | `site_editor`| `organizer`   |
| Per   | -              | `readonly` | `viewer` | -            | `staff`       |
| Lisa  | `admin_reader` | -          | `viewer` | -            | -             |

*Note: `-` means no role granted, user cannot access that client.*

## Future Enhancement: Delegated Administration

In the initial implementation, only `systemadmin` (for idem-admin) can assign roles for all clients. A future enhancement could support **delegated administration**:

### Proposed Extension

Add a `client_admin` role type that allows users to manage roles within a specific client:

```sql
-- Add admin flag to client_roles
ALTER TABLE idem.client_roles ADD COLUMN is_admin_role BOOLEAN DEFAULT false;
```

| Client     | Role with `is_admin_role=true` | Can assign roles for |
| ---------- | ------------------------------ | -------------------- |
| idem-admin | `systemadmin`                  | All clients          |
| argo-cd    | `admin`                        | argo-cd only         |
| grafana    | `admin`                        | grafana only         |
| historia   | `admin`                        | historia only        |

**Authorization logic:**

```text
Can user X assign role Y to user Z for client C?
  IF user X has systemadmin for idem-admin → YES (global admin)
  ELSE IF user X has admin role (is_admin_role=true) for client C → YES (delegated)
  ELSE → NO
```

This enables scenarios like:

- Argo team lead can grant `readonly` role to new team members
- Historia admin can manage content editor access
- Central IdP team retains override capability via `systemadmin`

*This enhancement is not part of the initial implementation but the schema supports adding it later.*

## Future Enhancement: RFC 8707 Resource Indicators

The `aud` claim is implemented as an array from the start to support future [RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707) compliance.

### Current Behavior

Tokens are issued for a single audience (the requesting client):

```json
{
  "aud": ["argo-cd"],
  "roles": ["readonly"]
}
```

### Future: Multiple Resource Servers

With RFC 8707, clients can request tokens valid for multiple resource servers:

```text
GET /authorize?
  client_id=web-app&
  resource=https://api.example.com&
  resource=https://graphql.example.com&
  scope=openid profile
```

Resulting token:

```json
{
  "aud": ["https://api.example.com", "https://graphql.example.com"],
  "roles": ["organizer"]
}
```

### Implementation Notes

To support RFC 8707:

1. Add `resource` parameter support to authorization endpoint
2. Validate requested resources against allowed audiences for the client
3. Include all requested resources in the `aud` claim
4. Resource servers validate their identifier is in the `aud` array

*This is prepared for but not implemented in the initial release.*

### Bootstrap: Creating the First Client and Admin

The system requires a bootstrap mechanism to create the first `systemadmin`. This is a one-time operation that should be disabled after initial setup.

**Account creation policy:** Any user can create an account by logging in via a configured IdP. However, accounts without roles have no access to any client applications. This is secure because:

- Account creation alone grants no privileges
- The `roles` claim will be an empty array until explicitly granted
- Only users with the bootstrap token can claim `systemadmin`
- Subsequent role assignments require `systemadmin` privileges

**Database seeding (runs on startup via migration):**

```sql
-- 1. Create the idem-admin OAuth client
INSERT INTO idem.oauth_clients (id, client_slug, client_name, redirect_uris)
VALUES (
  gen_random_uuid(),
  'idem-admin',
  'Idem Admin Console',
  ARRAY['http://localhost:3000/callback', 'https://admin.example.com/callback']
) ON CONFLICT (client_slug) DO NOTHING;

-- 2. Create the predefined roles for idem-admin
INSERT INTO idem.client_roles (oauth_client_id, role_name, description)
SELECT id, 'systemadmin', 'Full administrative access'
FROM idem.oauth_clients WHERE client_slug = 'idem-admin'
ON CONFLICT (oauth_client_id, role_name) DO NOTHING;

INSERT INTO idem.client_roles (oauth_client_id, role_name, description)
SELECT id, 'admin_reader', 'Read-only admin access'
FROM idem.oauth_clients WHERE client_slug = 'idem-admin'
ON CONFLICT (oauth_client_id, role_name) DO NOTHING;
```

**Bootstrap endpoint:**

```
POST /api/systemadmin/claim
Authorization: Bearer <bootstrap_token>
Content-Type: application/json

{
  "account_id": "uuid-of-logged-in-user"
}
```

The endpoint grants `systemadmin` role to the specified account. Only available when bootstrap mode is enabled.

**Configuration:**

| Environment Variable | Description | Example |
|---------------------|-------------|---------|
| `IDEM_BOOTSTRAP_ENABLED` | Enable bootstrap endpoint | `true` |
| `IDEM_BOOTSTRAP_TOKEN` | Secret token (min 32 chars) | `a1b2c3d4...` (cryptographically random) |

**Startup behavior:**

| Environment | Bootstrap enabled | Systemadmin exists | Behavior |
|-------------|-------------------|-------------------|----------|
| Development | `true` | Yes | ⚠️ Log WARNING, endpoint disabled |
| Development | `true` | No | ✅ Endpoint available |
| Production | `true` | Yes | ❌ Log ERROR, endpoint disabled |
| Production | `true` | No | ✅ Endpoint available |
| Any | `false` | Any | ✅ Endpoint not registered |

**Workflow:**

1. Set `IDEM_BOOTSTRAP_ENABLED=true` and `IDEM_BOOTSTRAP_TOKEN=<random-32-chars>`
2. Deploy Idem
3. Admin creates account (or logs in via IdP)
4. Admin calls `POST /api/bootstrap` with the token
5. Admin receives `systemadmin` role for `idem-admin` client
6. Remove environment variables (or set `IDEM_BOOTSTRAP_ENABLED=false`)
7. Redeploy

**Security considerations:**

- Token must be cryptographically random (use `openssl rand -hex 32`)
- Token comparison uses constant-time algorithm to prevent timing attacks
- All bootstrap attempts (success and failure) are logged to audit log
- Rate limiting applies to the endpoint
- First successful bootstrap wins; endpoint auto-disables after success

## Consequences

### Positive

- **Flexible authorization**: Each client can define custom roles
- **Scalable**: Supports multi-tenant scenarios without code changes
- **Standard pattern**: Follows Casbin's well-documented RBAC with Domains model
- **Database-driven**: All configuration in database, no hardcoded clients
- **Audit trail**: Role grants include `granted_by` and `granted_at` for compliance

### Negative

- **More complex queries**: Authorization requires joins across three tables
  - *Mitigation*: Create helper functions and optimize with proper indexes
- **Migration required**: Existing systemRole data must be migrated
  - *Mitigation*: Provide migration script
- **Breaking change**: Token claims change from `system_role` to `roles`
  - *Mitigation*: Coordinate with idem-admin deployment

### Security Considerations

- **Role assignment is privileged**: Only `systemadmin` can grant roles
- **Cascade deletes**: Deleting a client removes all its roles and grants
- **Audit logging**: All role changes (grants and revocations) are logged via existing audit infrastructure, providing full history of who granted/revoked what and when

## References

- [Casbin RBAC with Domains](https://casbin.org/docs/rbac-with-domains/)
- [RFC 8707: Resource Indicators for OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc8707)
- [Argo CD SSO Configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/)
- ADR 0007: Admin RBAC (superseded)
- ADR 0011: Audit and Compliance
