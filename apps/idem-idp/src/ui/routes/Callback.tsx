import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../lib/auth';

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (processedRef.current) {
      return;
    }
    processedRef.current = true;

    async function processCallback() {
      try {
        await handleCallback();
        // Redirect to admin dashboard
        navigate('/admin', { replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    }

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/session/clear" style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
          }}>
            Try Again
          </a>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Tip: If you see this error repeatedly, click "Clear Session & Try Again" to reset your authentication state.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Processing authentication...</p>
    </div>
  );
}
