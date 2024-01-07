# EF Migrations

All EF related commands must be run in the context of the Infrastructure project. So first, `cd` into its directory:

```bash
cd src/Eventuras.Infrastructure
```

## Adding a migration

```bash
dotnet ef migrations add MigrationDescription -s ../Eventuras.WebApi/Eventuras.WebApi.csproj
dotnet ef migrations script --idempotent -s ../Eventuras.WebApi/Eventuras.WebApi.csproj --output ./scripts/DateAndTime-Description.sql

```

## Applying a Migration

```bash
dotnet ef database update -s ../Eventuras.WebApi/Eventuras.WebApi.csproj
```
