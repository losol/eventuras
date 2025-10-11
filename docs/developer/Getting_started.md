# Getting Started for New Contributors

Welcome to Eventuras! This guide will help you get up and running quickly so you can start contributing to the project.

## Quick Start Checklist

- [ ] Install prerequisites (Node.js, .NET 8, PostgreSQL, Docker)
- [ ] Clone the repository
- [ ] Set up environment variables
- [ ] Install dependencies
- [ ] Run database migrations
- [ ] Start the development servers
- [ ] Run tests to verify setup
- [ ] Make your first contribution!

## Prerequisites

### Required Software

#### For Backend Development
- **.NET 8 SDK** or later - [Download](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Docker** (optional but recommended) - [Download](https://docs.docker.com/get-docker/)

#### For Frontend Development
- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm 10+** (comes with Node.js)

#### For All Developers
- **Git** - [Download](https://git-scm.com/downloads)
- **Code Editor** - We recommend [VS Code](https://code.visualstudio.com/) with these extensions:
  - C# Dev Kit (for .NET development)
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be 20.x or higher

# Check npm version
npm --version   # Should be 10.x or higher

# Check .NET version
dotnet --version  # Should be 8.x or higher

# Check PostgreSQL
psql --version  # Should be 12.x or higher

# Check Docker (optional)
docker --version
```

## Initial Setup

### 1. Clone the Repository

If you have write access:
```bash
git clone https://github.com/losol/eventuras.git
cd eventuras
```

If you're a new contributor:
```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/eventuras.git
cd eventuras
git remote add upstream https://github.com/losol/eventuras.git
```

### 2. Install Dependencies

Install all npm dependencies for frontend apps and libraries:

```bash
npm install
```

This will install dependencies for all workspaces in the monorepo.

### 3. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

The easiest way is to use the provided Docker Compose configuration:

```bash
docker-compose up -d postgres
```

This creates a PostgreSQL database with:
- Database name: `eventuras`
- Username: `eventuras`
- Password: `Str0ng!PaSsw0rd`
- Port: `5432`

#### Option B: Manual PostgreSQL Setup

If you prefer to use a local PostgreSQL installation:

1. Create a database:
```sql
CREATE DATABASE eventuras;
```

2. Create a user:
```sql
CREATE USER eventuras WITH PASSWORD 'Str0ng!PaSsw0rd';
GRANT ALL PRIVILEGES ON DATABASE eventuras TO eventuras;
```

### 4. Configure Environment Variables

#### Backend Configuration

The backend API uses `appsettings.Development.json` for local development settings. The default configuration should work out of the box with the Docker PostgreSQL setup.

If you need custom settings, create `appsettings.Development.json` in `apps/api/src/Eventuras.WebApi/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=eventuras;Username=eventuras;Password=Str0ng!PaSsw0rd"
  },
  "Auth": {
    "Issuer": "https://eventuras.eu.auth0.com/",
    "Audience": "https://api.eventuras.losol.io"
  }
}
```

You can also use the `dotnet user-secrets` tool for sensitive data:

```bash
cd apps/api/src/Eventuras.WebApi
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=eventuras;Username=eventuras;Password=Str0ng!PaSsw0rd"
```

#### Frontend Configuration

Create a `.env.local` file in `apps/web/`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APPLICATION_URL=http://localhost:3000

# Auth0 Configuration (for development)
NEXTAUTH_URL=http://localhost:3000
AUTH0_DOMAIN=eventuras.eu.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_API_AUDIENCE=https://api.eventuras.losol.io
NEXTAUTH_SECRET=your_nextauth_secret_here
```

> **Note:** Contact the project maintainers to get development Auth0 credentials, or set up your own Auth0 application.

### 5. Run Database Migrations

Navigate to the API directory and run migrations:

```bash
cd apps/api
dotnet ef database update --project src/Eventuras.WebApi
```

This will create all necessary tables and seed initial data, including the admin user.

### 6. Start Development Servers

#### Option A: Start Everything with Docker Compose (Easiest)

```bash
docker-compose up
```

This starts:
- PostgreSQL database
- Backend API at `http://localhost:5100`
- Frontend at `http://localhost:3000`

#### Option B: Start Services Individually

**Terminal 1 - Start the Backend API:**
```bash
cd apps/api
dotnet run --project src/Eventuras.WebApi
```

The API will be available at:
- HTTP: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger` (only in Development mode)

**Terminal 2 - Start the Frontend:**
```bash
cd apps/web
npm run dev
```

The frontend will be available at `http://localhost:3000`

**Terminal 3 - (Optional) Start Historia:**
```bash
cd apps/historia
npm run dev
```

Historia will be available at `http://localhost:3001`

**Terminal 4 - (Optional) Start ConvertoAPI:**
```bash
cd apps/convertoapi
npm run dev
```

ConvertoAPI will be available at `http://localhost:4000`

## Default Login Credentials

Once everything is running, you can log in with the default admin account:

```
Email: admin@email.com
Password: Str0ng!PaSsw0rd
```

> **Security Note:** Change these credentials in production environments!

## Verify Your Setup

### 1. Run Backend Tests

```bash
cd apps/api
dotnet test
```

All tests should pass. If any fail, check your database connection and configuration.

### 2. Run Frontend Tests

```bash
# Unit tests (if available)
npm run test

# E2E tests with Playwright
cd apps/web-e2e
npx playwright install  # First time only
npm run test:e2e
```

### 3. Check the API

Visit `http://localhost:5000/swagger` to see the API documentation.

Try a test request:
```bash
curl http://localhost:5000/api/v3/health
```

You should get a `200 OK` response.

### 4. Check the Frontend

1. Visit `http://localhost:3000`
2. You should see the Eventuras home page
3. Try logging in with the admin credentials
4. Navigate to different pages to verify functionality

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use conventional branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 2. Make Changes

#### For Backend Changes
- Edit files in `apps/api/`
- Follow C# naming conventions (PascalCase for public members)
- Add XML documentation comments for public APIs
- Write unit tests for business logic

#### For Frontend Changes
- Edit files in `apps/web/`, `apps/historia/`, or `libs/`
- Follow TypeScript/React best practices
- Use functional components and hooks
- Extract reusable code to `libs/`
- Add Storybook stories for new components

### 3. Run Linters and Formatters

```bash
# Lint and format frontend code
npm run lint
npm run format

# Check backend code (if available)
cd apps/api
dotnet format
```

### 4. Run Tests

```bash
# Backend tests
cd apps/api
dotnet test

# Frontend E2E tests
cd apps/web-e2e
npm run test:e2e
```

### 5. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(api): add event filtering endpoint"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

The commit message will be validated by Husky pre-commit hooks.

### 6. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub:
1. Go to https://github.com/losol/eventuras
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Request reviews from maintainers

## Useful Commands

### Monorepo Commands

```bash
# Install dependencies
npm install

# Run all builds
npm run build

# Run specific app
npm run dev --workspace=apps/web

# Run linters
npm run lint

# Clean all builds
npm run clean
```

### Backend Commands

```bash
# Run API
dotnet run --project apps/api/src/Eventuras.WebApi

# Run tests
dotnet test

# Create migration
dotnet ef migrations add MigrationName --project apps/api/src/Eventuras.WebApi

# Update database
dotnet ef database update --project apps/api/src/Eventuras.WebApi

# Format code
dotnet format
```

### Frontend Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Run linter
npm run lint

# Run formatter
npm run format

# Run Storybook
npm run storybook

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Database Connection Issues

**Error:** `Could not connect to database`

**Solutions:**
1. Verify PostgreSQL is running: `docker ps` or `pg_isready`
2. Check connection string in `appsettings.Development.json`
3. Ensure database exists: `psql -U eventuras -d eventuras -c "SELECT 1;"`
4. Check credentials match

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solutions:**
1. Stop other applications using the port
2. Change port in `launchSettings.json` (for API)
3. Change port in `package.json` dev script (for frontend)

### Node Modules Issues

**Error:** `Cannot find module '...'`

**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### Migration Issues

**Error:** `Migration failed`

**Solutions:**
1. Ensure database is running and accessible
2. Drop and recreate database:
```bash
dotnet ef database drop --project apps/api/src/Eventuras.WebApi
dotnet ef database update --project apps/api/src/Eventuras.WebApi
```

### Build Errors

**Error:** `Build failed`

**Solutions:**
```bash
# Clean all builds
npm run clean

# Rebuild
npm run build

# For .NET projects
dotnet clean
dotnet build
```

## Next Steps

Now that you're set up, here's where to go next:

1. **Read the Architecture Overview** - [`Architecture_overview.md`](./Architecture_overview.md)
2. **Understand the Codebase** - Explore `apps/` and `libs/` directories
3. **Pick an Issue** - Find a "good first issue" on GitHub
4. **Ask Questions** - Use GitHub Discussions or contact maintainers
5. **Make Your First PR** - Start with documentation or small fixes

## Getting Help

- **GitHub Issues:** [Report bugs or request features](https://github.com/losol/eventuras/issues)
- **GitHub Discussions:** [Ask questions and discuss ideas](https://github.com/losol/eventuras/discussions)
- **Documentation:** Check the `docs/` folder
- **Code Comments:** Read inline documentation in the code

## Contributing Guidelines

Please read our [Contributing Guide](../../CONTRIBUTING.md) for:
- Code of Conduct
- Pull Request process
- Coding standards
- Review process

Welcome aboard! We're excited to have you contribute to Eventuras! 🎉
