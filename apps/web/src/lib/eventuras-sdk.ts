/**
 * Eventuras SDK Re-export with Auto-Configuration
 *
 * This module re-exports all SDK functions from @eventuras/event-sdk
 * but ensures the client is configured before any function is called.
 *
 * ## Why this wrapper exists
 *
 * The SDK uses a global `client` object that must be configured with the backend URL
 * and authentication before making API calls. Due to Next.js module bundling and
 * import resolution order, we cannot rely on side-effect imports in layout.tsx to
 * configure the client before page components use it.
 *
 * This wrapper ensures configuration happens in the correct order:
 * Page → this wrapper → configured client → SDK functions
 *
 * ## Usage
 *
 * ✅ Correct:  import { getV3EventsById } from '@/lib/eventuras-sdk';
 * ❌ Wrong:    import { getV3EventsById } from '@eventuras/event-sdk';
 *
 * ## For server actions
 *
 * Server actions can import the `client` directly from '@/lib/eventuras-client'
 * if they need to pass it explicitly (though the global client is usually enough).
 */

// Import for side-effect: ensures client is configured
import './eventuras-client';

// Re-export everything from the SDK
export * from '@eventuras/event-sdk';
