/**
 * Check if code is running in the browser
 * Safe to use for conditional logic that should only run client-side
 */
export const canUseDOM = typeof globalThis.window !== 'undefined';
