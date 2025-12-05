# Historia - The CMS where stories are told

Historia is a CMS that allows you to create and manage stories. It is built on top of [Payload](https://payloadcms.com), a headless CMS that provides a powerful and flexible API for your data.

**Experimental, not ready for production use yet**

## Database Migrations

Historia uses Payload CMS's built-in migration system. When you modify collections or fields, you should create and run migrations:

```bash
# Generate a migration based on schema changes
pnpm payload migrate:create

# Run pending migrations
pnpm payload migrate

# Check migration status
pnpm payload migrate:status

# Refresh the database (drops all tables and recreates - development only!)
pnpm payload migrate:refresh
```

Migrations are stored in `src/migrations/` and are automatically run when the application starts in production.
