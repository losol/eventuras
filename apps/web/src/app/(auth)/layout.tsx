import type { ReactNode } from 'react';

/**
 * (auth) Route Group Layout
 * For authentication routes: /api/login/*
 * Minimal layout - no navbar or footer
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
