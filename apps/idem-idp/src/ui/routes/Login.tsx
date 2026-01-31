import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startLogin } from '../lib/auth';

/**
 * Clear all oidc-provider cookies via server-side endpoint
 * This is needed because oidc-provider uses httpOnly cookies that can't be cleared from JS
 */
async function clearOidcSession(): Promise<void> {
  console.log('[Login] Clearing OIDC session cookies via server...');
  try {
    // Use POST to /session/clear which returns JSON
    // This ensures cookies are properly cleared before starting a new auth flow
    const response = await fetch('/session/clear', {
      method: 'POST',
      credentials: 'include',
    });
    const result = await response.json();
    console.log('[Login] Session cookies cleared:', result);
  } catch (error) {
    // Ignore errors - cookies might still be cleared
    console.warn('[Login] Error clearing session cookies:', error);
  }
}

export default function Login() {
  const { t } = useTranslation();

  // Clear client-side storage if redirected from /session/clear
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cleared') === '1') {
      console.log('[Login] Clearing client storage after session clear redirect');
      try { sessionStorage.clear(); } catch (e) { /* ignore */ }
      try { localStorage.clear(); } catch (e) { /* ignore */ }
      // Remove the query param from URL without reload
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleLogin = async () => {
    try {
      // Clear any stale OIDC httpOnly cookies via server endpoint
      await clearOidcSession();
      // Also clear sessionStorage PKCE state
      sessionStorage.clear();

      await startLogin();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1 style={{ marginTop: 0 }}>{t('auth.login.title')}</h1>
        <p style={{ color: '#666' }}>{t('auth.login.description')}</p>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {t('auth.login.button')}
        </button>
      </div>
    </div>
  );
}
