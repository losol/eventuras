import { useEffect, useState } from 'react';

export default function Home() {
  const [version, setVersion] = useState('dev');

  useEffect(() => {
    // Fetch version from package.json or API
    setVersion(import.meta.env.VITE_APP_VERSION || 'dev');
  }, []);

  return (
    <div style={{
      background: 'radial-gradient(circle, #0f172a 0%, #1e293b 50%, #020617 100%)',
      color: 'white',
      fontFamily: 'system-ui, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
      textAlign: 'center',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        backgroundColor: '#22c55e',
        borderRadius: '50%',
        animation: 'pulse 2s infinite',
        marginBottom: '20px',
      }} />

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1); opacity: 1; }
          50%  { transform: scale(1.5); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <h1 style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>
        idem-idp is running 🚀
      </h1>
      <p style={{ margin: '0.25rem 0' }}>
        Eventuras experimental OpenID Connect Provider
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0' }}>
        version {version}
      </p>

      <div style={{
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        <a
          href="/health"
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            color: '#93c5fd',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          Health Check
        </a>
        <a
          href="/.well-known/openid-configuration"
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            color: '#93c5fd',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          OIDC Discovery
        </a>
        <a
          href="/.well-known/jwks.json"
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            color: '#93c5fd',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          Public Keys (JWKS)
        </a>
      </div>
    </div>
  );
}
