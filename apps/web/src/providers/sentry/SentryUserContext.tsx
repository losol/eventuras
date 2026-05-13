'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

import { useAuthStore } from '@/auth/authStore';
import { getSentryUserId } from '@/utils/auth/getSentryUserId';

/**
 * Mirrors authStore state into Sentry's user context. Only the OIDC `sub`
 * is attached — no name or email — so events stay linkable to a user without
 * leaking PII to GlitchTip.
 */
export function SentryUserContext() {
  const { isAuthenticated, isInitializing } = useAuthStore();

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated) {
      Sentry.setUser(null);
      return;
    }

    let cancelled = false;
    getSentryUserId()
      .then(id => {
        if (cancelled || !id) return;
        Sentry.setUser({ id });
      })
      .catch(() => {
        // Errors here should not break the UI; the server action already logs.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isInitializing]);

  return null;
}
