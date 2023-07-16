
# Authorization model spec


## Overview

| Policy                    | Description                                              | Organization admin                | Course admin               | Admin                               | Site admin                          |
|---------------------------|----------------------------------------------------------|-----------------------------------|----------------------------|-------------------------------------|-------------------------------------|
| Manage site admins        | Can manage site admins.                                  |                                   |                            |                                     | v                                   |
| Manage site organisations | Can manage all site organizations.                       | v                                 |                            | v                                   | v                                   |
| Manage users              | Can manage all site users.                               |                                   |                            | v                                   | v                                   |
| Manage organisation       | Can manage organisation info and events for organisation | v                                 |                            | v                                   | v                                   |
| Manage individual event   | Can edit indiviudal event details                        | Create or events for organization | Only edit individual event | Create events for all organizations | Create events for all organizations |
| Set admin privileges      |                                                          | None                              | None                       | Promote new admins                  | Promote admins to site owner        |


## User Roles

Role | Description
---|---
Site Admin | Can manage organizations, courses & users.
Organization Admin | Can manage an organization’s courses & admins.
Course Admin | Can manage an individual course.
&lt;No role> | Users registered for a course.


Claim | Value | Applicable to | Description
--- | --- | --- | ---
Site Owner |  `true`\|`false` | Site Admin | The Site Admin is a Site Owner.
Organization Owner | `OrgId` (`int`) | Organization Admin | The user is the owner of Organization with `Id = OrgId`
Organization Admin | `OrgId` (`int`) | Organization Admin | The user is the admin of organization with `Id = OrgId`
Course Admin | `EventPostId` (`int`) | Course Admin | Users registered for a course.

### Site Admin

1.  Can create, edit, suspend & delete organizations.
2.  Can create, edit & delete courses.
3.  Site Owner → Site Admin with a Site Owner claim set.
    -   Only the site owner can create other Site Admin users.
    -   Can set other Site Admins as site owners.
    -   Is effectively a super admin -- has privileges to delete anything and everything except for his own user account.

### Organization Admin

1.  Can manage organization information.
2.  Can manage courses.
3.  Can create course admins.
4.  Organization owner → Organization Admin with Org Owner claim set.
    -   Default org owner set by Site Admin when creating the organization.
    -   Only org owners can create other Org Admins.
    -   Can set other Org Admins as org owners.
    -   Org owners can only be deleted by other org owners & by Site Admins.
    

**Organization Management Authorization logic:**

1.  Site Admins will always be allowed.    
2.  For Organization Admins, a resource based policy will be executed against the Organization object to check if the user is an org admin for the given org.
    

### Course Admin

1.  Can manage an individual course.

**Course management authorization logic**

1.  Site Admins will always be allowed.
2.  Org admins will be allowed if the user passes a resource based authorization against the organization the course belongs to.
3.  Course Admins will be allowed the user passes a resource based authorization against the course itself.

## Policies

Policy | Description
--- | ---
Manage site admins policy | Can manage site admins.
Manage site orgs policy | Can manage all site organizations.
Manage site users policy | Can manage all site users.
Manage organization policy | Can manage a given organization’s information.
Manage organization admins policy | Can manage a given organization’s admins.
Manage organization courses policy | Can manage a given organization’s courses.
Manage course admins policy. | Can manage a given course’ admins
Manage course policy | Can manage a given course.

### Policy rules

### Manage site admins policy

-   Allow site owners.
    

### Manage site orgs policy

-   Allow site admins.
    

### Manage site users policy

-   Allow site admins.
    

### Manage organization policy

-   Allow site admin.
-   Allow organization owners.
    

### Manage organization admins policy

-   Allow site admins.
-   Allow organization owners.
    

### Manage organization courses policy

-   Allow site admins.
-   Allow organization admins.
    

### Manage course admins policy

-   Allow site admins.
-   Allow organization admins.
    

### Manage course admins policy

-   Allow site admins.
-   Allow organization admins.
-   Allow course admins.
