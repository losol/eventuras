# EF Migrations

All EF related commands must be run in the context of the Infrastructure project. So first, `cd` into its directory:

```bash
cd src/Eventuras.Infrastructure
```

## Adding a migration

```bash
dotnet ef migrations add ExtInfoPage -s ../Eventuras.Web/Eventuras.Web.csproj
```

## Applying a Migration

```bash
dotnet ef database update -s ../Eventuras.Web/Eventuras.Web.csproj
```
