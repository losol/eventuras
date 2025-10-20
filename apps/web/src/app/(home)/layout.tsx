import type { ReactNode } from 'react';
import './home-layout.css';

/**
 * Homepage layout - overrides the root layout's main container
 * to allow full-width hero sections with navbar overlay.
 *
 * Uses route group (home) to apply special styling without affecting URL structure.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className="home-layout">{children}</div>;
}
