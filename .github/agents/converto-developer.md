# Converto Agent

## Scope
- `apps/convertoapi`
- Standalone HTML-to-PDF conversion API service

## Responsibilities

### Primary Responsibilities
- Develop and maintain the Converto PDF conversion API.
- Convert HTML to high-quality PDFs (e.g., for certificates).
- Handle PDF rendering using Playwright or equivalent.
- Ensure secure, performant, and reliable conversions.
- Maintain clear API documentation and environment setup.

## Tech Stack

- Language: TypeScript
- Runtime: Node.js (latest LTS)
- Web Framework: Fastify (current) → Express.js (planned migration)
- PDF Generation: Playwright
- Auth: JWT
- API Documentation: OpenAPI/Swagger (plus visual reference if desired)
- Rate Limiting: middleware to protect from abuse

## Coding Standards

### Naming Conventions
- Files: kebab-case (e.g., `pdf-converter.ts`)
- Functions: camelCase (e.g., `convertHtmlToPdf`)
- Types/Interfaces: PascalCase (e.g., `ConversionOptions`, `PdfResult`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_PDF_SIZE`)

### Best Practices
- Enable TypeScript strict mode.
- Validate inputs with schemas (e.g., Zod).
- Implement error handling with consistent error shapes.
- Use async/await and ensure resource cleanup (browser/page).
- Implement timeouts for long-running operations.
- Use structured logging.
- Enforce rate limiting and authentication.

## Maintaining Skills

As the Converto Developer, I'm responsible for keeping PDF generation and microservice-related skills up to date:

**My Skills:**
- Future: `pdf-generation-patterns`, `playwright-pdf`, `microservice-architecture`

**When to Update:**
- ✅ When discovering new Playwright PDF generation patterns
- ✅ When performance optimization techniques emerge
- ✅ When security best practices evolve
- ✅ When error handling patterns improve
- ✅ When migrating from Fastify to Express.js

**How to Update:**
1. Document effective PDF generation patterns in skill files
2. Include browser resource management best practices
3. Update authentication and security patterns
4. Capture performance optimization strategies

## API Design
