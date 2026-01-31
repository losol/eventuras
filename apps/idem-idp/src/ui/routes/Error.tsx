import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const [isDevMode, setIsDevMode] = useState(false);

  const message = searchParams.get('message') || 'An error occurred during authentication. Please try again.';
  const errorName = searchParams.get('errorName');
  const errorCode = searchParams.get('errorCode');
  const stack = searchParams.get('stack');

  // Check if this is a session-related error
  const isSessionError = message.toLowerCase().includes('session') ||
    message.toLowerCase().includes('not found') ||
    errorCode === 'invalid_grant';

  useEffect(() => {
    // Check if we're in development mode
    fetch('/api/health')
      .then(() => setIsDevMode(import.meta.env.DEV))
      .catch(() => {});
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '0 1rem',
      lineHeight: '1.6',
    }}>
      <h1 style={{ color: '#d32f2f' }}>Authentication Error</h1>
      <p>{message}</p>

      {isDevMode && (errorName || errorCode || stack) && (
        <details style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Error Details (Development Only)
          </summary>
          {errorName && (
            <pre style={{ overflowX: 'auto', fontSize: '0.875rem' }}>
              Error Name: {errorName}
            </pre>
          )}
          {errorCode && (
            <pre style={{ overflowX: 'auto', fontSize: '0.875rem' }}>
              Error Code: {errorCode}
            </pre>
          )}
          {stack && (
            <pre style={{ overflowX: 'auto', fontSize: '0.875rem' }}>
              Stack Trace:{'\n'}{decodeURIComponent(stack)}
            </pre>
          )}
        </details>
      )}

      {!isDevMode && (
        <p>If the problem persists, please contact support.</p>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <a
          href="/session/clear"
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Clear Session & Try Again
        </a>
      </div>

      {isSessionError && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Tip: If you see this error repeatedly, click "Clear Session & Try Again" to reset your authentication state.
        </p>
      )}
    </div>
  );
}
