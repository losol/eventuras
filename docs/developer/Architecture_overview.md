# Architecture Overview

## Introduction

Eventuras is a modern, open-source platform for content, knowledge, event and course management. Built as a monorepo, it provides a scalable architecture that separates concerns while maintaining code reusability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  Web App   │  │  Historia  │  │   Docsite  │    │
│  │ (Next.js)  │  │  (Next.js) │  │ (Next.js)  │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└─────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              (.NET Core REST API)                    │
└─────────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │ConvertoAPI│   │  Auth0   │
    │ Database │   │    (PDF)   │   │   IdP    │
    └──────────┘   └──────────┘   └──────────┘
```

## Monorepo Structure

The project uses **Turborepo** with **npm workspaces** for efficient monorepo management.

### Directory Layout

```
eventuras/
├── apps/               # Main applications
│   ├── api/            # .NET Core backend API
│   ├── web/            # Next.js customer/admin frontend
│   ├── historia/       # Knowledge management CMS
│   ├── convertoapi/    # PDF generation microservice
│   ├── docsite/        # Documentation website
│   ├── idem-idp/       # Identity provider
│   └── web-e2e/        # End-to-end tests
│
├── libs/               # Shared libraries
│   ├── sdk/            # TypeScript API client
│   ├── smartform/      # Form system with validation
│   ├── ratio-ui/       # UI components library
│   ├── fides-auth/     # Authentication utilities
│   ├── scribo/         # Markdown editor
│   ├── markdown/       # Markdown processing
│   ├── event-sdk/      # Event-specific SDK
│   ├── datatable/      # Data table components
│   ├── toast/          # Toast notifications
│   └── utils/          # Shared utilities
│
└── docs/               # Documentation
    ├── developer/      # Developer guides
    ├── administrator/  # Admin documentation
    ├── deployment/     # Deployment guides
    └── business/       # Business logic docs
```

## Core Applications

### 1. API (`apps/api`)

**Technology:** .NET 8, ASP.NET Core, Entity Framework Core, PostgreSQL

The backend API is the heart of the Eventuras platform, providing:

- **Event Management:** CRUD operations for events, courses, and conferences
- **Registration System:** User registration, product selection, and order management
- **User Management:** Authentication, authorization, and role-based access control
- **Payment Processing:** Integration with Stripe for invoicing
- **Certificate Generation:** Automated certificate creation for participants
- **Email/SMS:** Notification system for communications
- **Integrations:** PowerOffice, Sentry, health checks

**Key Architectural Patterns:**
- Clean Architecture with separation of concerns
- Repository pattern for data access
- Dependency Injection throughout
- Feature flags for gradual rollouts
- Asynchronous operations for I/O

### 2. Web Frontend (`apps/web`)

**Technology:** Next.js 15, React 19, TypeScript 5.9, Tailwind CSS 4

Modern, responsive frontend application serving:

- **Participant Interface:** Event browsing, registration, profile management
- **Organizer Dashboard:** Event creation, participant management, reporting
- **Multi-language Support:** Internationalization with next-intl
- **Server-Side Rendering:** Optimal performance and SEO
- **Real-time Updates:** WebSocket support for live data

**Key Features:**
- Server Components by default for performance
- Client Components only when interactivity needed
- Responsive design with mobile-first approach
- Accessibility compliance (WCAG 2.1)
- Integration with shared UI libraries

### 3. Historia (`apps/historia`)

**Technology:** Next.js, React, TypeScript

Knowledge management CMS (in development) for:
- Documentation management
- Content versioning
- Collaborative editing
- Search and discovery

### 4. ConvertoAPI (`apps/convertoapi`)

**Technology:** Node.js, Fastify, Playwright

Microservice for PDF generation:
- HTML to PDF conversion
- Certificate generation
- Invoice creation
- Uses Playwright for rendering

### 5. DocSite (`apps/docsite`)

**Technology:** Next.js, MDX

Documentation website that:
- Syncs content from `/docs` folder
- Provides searchable documentation
- Offers interactive examples

## Shared Libraries (`libs/`)

### Core Libraries

#### `@eventuras/sdk`
TypeScript SDK for API integration:
- Type-safe API client
- Auto-generated from OpenAPI spec
- Request/response validation
- Error handling

#### `@eventuras/smartform`
Intelligent form system:
- Schema-based validation
- Dynamic form generation
- Multi-step forms
- Accessibility built-in

#### `@eventuras/ratio-ui`
Design system and UI components:
- React Aria Components foundation
- Tailwind CSS styling
- Storybook documentation
- Responsive components

#### `@eventuras/fides-auth`
Authentication utilities:
- Auth0 integration
- Token management
- Protected route helpers
- SSR-compatible

## Data Flow

### Event Registration Flow

```
User → Web Frontend → API → Database
                        ↓
                  Email Service
                        ↓
                  PDF Generator (ConvertoAPI)
```

1. User browses events on Web Frontend
2. User selects event and products
3. Frontend calls API with registration data
4. API validates and stores in PostgreSQL
5. API triggers email notification
6. API requests certificate from ConvertoAPI
7. User receives confirmation email with certificate

### Authentication Flow

```
User → Web Frontend → Auth0 → API
                        ↓
                  Token Validation
                        ↓
                  Role-based Access
```

1. User initiates login on Web Frontend
2. Redirected to Auth0 for authentication
3. Auth0 returns JWT token
4. Frontend includes token in API requests
5. API validates token with Auth0
6. API checks user roles and permissions
7. API returns authorized data

## Technology Stack

### Backend
- **.NET 8:** Modern C# with async/await
- **PostgreSQL:** Relational database
- **Entity Framework Core:** ORM
- **ASP.NET Core:** Web framework
- **Swagger/OpenAPI:** API documentation

### Frontend
- **Next.js 15:** React framework with App Router
- **React 19:** UI library
- **TypeScript 5.9:** Type safety
- **Tailwind CSS 4:** Utility-first styling
- **React Aria Components:** Accessible components

### Development Tools
- **Turborepo:** Monorepo build system
- **npm Workspaces:** Package management
- **Playwright:** E2E testing
- **Storybook:** Component development
- **ESLint/Prettier:** Code quality
- **Husky:** Git hooks
- **Conventional Commits:** Commit standards

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN             │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
┌─────────────┐         ┌─────────────┐
│ Web App     │         │ API         │
│ (Vercel)    │         │ (Docker)    │
└─────────────┘         └─────────────┘
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
            ┌─────────────┐         ┌─────────────┐
            │ PostgreSQL  │         │ ConvertoAPI │
            │ (Managed)   │         │ (Docker)    │
            └─────────────┘         └─────────────┘
```

### Key Infrastructure
- **Frontend Hosting:** Vercel for Next.js apps
- **API Hosting:** Docker containers
- **Database:** Managed PostgreSQL (e.g., Azure Database)
- **PDF Service:** Containerized ConvertoAPI
- **CDN:** Edge caching for static assets
- **Monitoring:** Sentry for error tracking

## Security Architecture

### Authentication & Authorization
- **OAuth 2.0 / OpenID Connect:** Via Auth0
- **JWT Tokens:** Stateless authentication
- **Role-Based Access Control (RBAC):** Fine-grained permissions
- **Organization Isolation:** Multi-tenant support

### Data Security
- **Encryption at Rest:** Database encryption
- **Encryption in Transit:** TLS/HTTPS only
- **Secret Management:** Environment variables, Azure Key Vault
- **Input Validation:** All user inputs sanitized
- **SQL Injection Prevention:** Parameterized queries

### API Security
- **CORS:** Restricted origins
- **Rate Limiting:** Protection against abuse
- **API Keys:** Service-to-service authentication
- **Content Security Policy:** XSS protection

## Scalability Considerations

### Horizontal Scaling
- **Stateless API:** Can scale across multiple instances
- **Database Connection Pooling:** Efficient resource usage
- **CDN Caching:** Reduces server load
- **Async Processing:** Background jobs for heavy operations

### Performance Optimization
- **Server-Side Rendering:** Fast initial page loads
- **Static Generation:** Pre-rendered pages where possible
- **Code Splitting:** Lazy loading of components
- **Database Indexing:** Optimized queries
- **Caching Strategy:** Redis for session/data caching

## Development Workflow

### Build System
- **Turborepo:** Intelligent task caching
- **Incremental Builds:** Only rebuilds changed packages
- **Parallel Execution:** Maximizes CI/CD speed
- **Shared Dependencies:** Deduplication via npm workspaces

### CI/CD Pipeline
1. **Commit:** Husky validates commit message
2. **Pre-commit:** Lint-staged runs ESLint/Prettier
3. **Push:** GitHub Actions triggered
4. **Build:** Turbo builds affected packages
5. **Test:** Unit and E2E tests run
6. **Deploy:** Automatic deployment on success

## Extension Points

### Adding New Applications
1. Create app in `apps/` directory
2. Add to `package.json` workspaces
3. Configure Turbo pipeline in `turbo.json`
4. Follow architectural patterns

### Adding New Libraries
1. Create lib in `libs/` directory
2. Export via `index.ts`
3. Document in README.md
4. Add Storybook stories (if UI)
5. Write tests

### Integration Points
- **API Extensions:** Add controllers and services
- **Custom Providers:** Email, SMS, Payment gateways
- **Webhooks:** Event-driven integrations
- **Plugins:** Extend functionality dynamically

## Best Practices

### Code Organization
- **Feature-based Structure:** Group by domain, not type
- **Dependency Direction:** Always inward (libs ← apps)
- **Shared Code:** Extract to libs early
- **Type Safety:** Strict TypeScript everywhere

### Data Management
- **Single Source of Truth:** API owns all data
- **Validation:** Backend validates, frontend hints
- **Optimistic Updates:** Better UX where safe
- **Error Handling:** Graceful degradation

### Testing Strategy
- **Unit Tests:** Business logic and utilities
- **Integration Tests:** API endpoints with test DB
- **E2E Tests:** Critical user journeys
- **Component Tests:** UI components in isolation

## Further Reading

- [Development Setup](./Development_setup.md)
- [Configuration Guide](./Configuration.md)
- [API Documentation](../../apps/api/README.md)
- [Frontend Documentation](../../apps/web/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)
