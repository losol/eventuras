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

## API Design
