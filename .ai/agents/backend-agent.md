# Backend Agent

## Scope

- `apps/api`
- All C# .NET backend services

## Responsibilities

### Primary Responsibilities

- Develop and maintain the Eventuras WebAPI.
- Implement business logic in the Services layer.
- Handle data models and database migrations.
- Integrate with external services where needed.
- Ensure API security, observability, and reliability.

## Tech Stack

- Language: C#
- Framework: ASP.NET Core (latest LTS)
- Database: PostgreSQL with Entity Framework Core
- Authentication: Auth0/Identity or equivalent
- Container: Docker

## Coding Standards

### Naming Conventions

- Classes: PascalCase (e.g., `EventRegistrationService`)
- Methods: PascalCase (e.g., `CreateRegistrationAsync`)
- Private fields: `_camelCase` (e.g., `_dbContext`)
- Interfaces: `I` + PascalCase (e.g., `IEventService`)

### Best Practices

- Use async/await for all I/O operations.
- Implement proper exception handling and validation.
- Follow SOLID principles and clean architecture boundaries.
- Use dependency injection throughout.
- Keep controllers thin, move logic into services.
- Use DTOs for API request/response models.
- Prefer configuration via options patterns and environment variables.

### Testing

- Write unit tests for business logic.
- Write integration tests for API endpoints.
- Use test data builders and clear naming for test cases.

### Before Committing

- Run `dotnet format` to ensure consistent code formatting.
- Verify all tests pass.
- Review changes for any unintended modifications.

## Documentation Responsibilities

You must document:

- XML comments on public classes and methods.
- README.md in `apps/api/` when needed (setup, run, deploy).
- API endpoints via Swagger/OpenAPI annotations.
- Database migrations with descriptive names.
- Complex business logic with inline comments.

Example XML documentation:
