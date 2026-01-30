/**
 * Global test setup
 * Runs before all tests
 */

// Set test environment variables
// Use 'development' so config.issuer resolves correctly
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Use test database if available, otherwise fall back to dev database
const testDbUrl = process.env.IDEM_DATABASE_URL;

if (!testDbUrl) {
  throw new Error(
    'No database URL found. Set IDEM_DATABASE_URL environment variable.'
  );
}

process.env.IDEM_DATABASE_URL = testDbUrl;

// Don't override IDEM_SESSION_SECRET and IDEM_MASTER_KEY - use dev defaults from config.ts
// This allows tests to decrypt JWKS keys that were generated in dev mode

// Suppress logs during tests (optional)
if (process.env.SILENT_TESTS !== 'false') {
  // You can suppress logs here if needed
  // console.log = () => {};
}
