# EF Migrations

All EF related commands must be run in the context of the Infrastructure project. So first, `cd` into its directory:

```bash
cd src/EventManagement.Infrastructure
```

## Adding a migration
```bash
dotnet ef migrations add YourMigrationClassName -s ../EventManagement.Web/EventManagement.Web.csproj
```

## Applying a Migration
```bash
dotnet database update
```