# Auth0 Integration

## Installation

1. Configure "Auth0" domain as described here: https://auth0.com/docs/quickstart/webapp/aspnet-core-3/01-login#configure-auth0
2. Put configuration into `application.json` or User Secrets:

```
{
    ...
    "Auth0": {
        "Enabled": true,
        "Domain": "yourdomain.auth0.com",
        "ClientId": "<put client id here>",
        "ClientSecret": "<put client secret here>"
    }
}
```
3. Done

## Handling Admin and SuperAdmin roles

This tutorial shows how to setup roles in Auth0: https://auth0.com/docs/quickstart/webapp/aspnet-core-3/03-authorization#create-a-rule-to-assign-roles

After setting up Auth0 rule add the following to the "Auth0" config in app settings:

```
{
    ...
    "Auth0": {
        ...
        "RoleClaimType": "<put claim type here>"
    }
}
```

In the example it's `"https://schemas.quickstarts.com/roles"`, it can also be just `"roles"` which is the default in EventManagement.
