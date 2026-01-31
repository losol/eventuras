import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface InteractionDetails {
  uid: string;
  prompt: { name: string };
  params: {
    client_id: string;
    scope: string;
    redirect_uri: string;
  };
  session?: {
    accountId: string;
  };
}

export default function Interaction() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<InteractionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    fetch(`/interaction/${uid}/details`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch interaction details');
        return res.json();
      })
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [uid]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error || 'Failed to load interaction details'}</p>
      </div>
    );
  }

  if (details.prompt.name === 'login') {
    return <LoginPrompt uid={uid!} details={details} />;
  }

  if (details.prompt.name === 'consent') {
    return <ConsentPrompt uid={uid!} details={details} />;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Unknown Prompt</h1>
      <p>Prompt type: {details.prompt.name}</p>
    </div>
  );
}

function LoginPrompt({ uid, details }: { uid: string; details: InteractionDetails }) {
  const [accountId, setAccountId] = useState('');

  return (
    <div style={{
      maxWidth: '400px',
      margin: '4rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h1 style={{ marginTop: 0, fontSize: '1.5rem', color: '#1e293b' }}>Sign In</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
          <strong>Application:</strong> {details.params.client_id}
        </p>
        <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
          <strong>Requested scopes:</strong> {details.params.scope}
        </p>
      </div>

      {/* Use a plain HTML form POST - this will naturally follow the OIDC provider's redirect */}
      <form method="POST" action={`/interaction/${uid}/login`}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="accountId" style={{ display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
            Account ID (Development)
          </label>
          <input
            id="accountId"
            name="accountId"
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Enter account ID"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <small style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            In development, any account ID works. In production, use real credentials.
          </small>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

function ConsentPrompt({ uid, details }: { uid: string; details: InteractionDetails }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async (allow: boolean) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/interaction/${uid}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rejectedScopes: allow ? [] : details.params.scope.split(' '),
          rejectedClaims: [],
        }),
      });

      if (!res.ok) {
        throw new Error('Consent failed');
      }

      // Provider redirects automatically
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const scopes = details.params.scope.split(' ').filter(Boolean);

  return (
    <div style={{
      maxWidth: '400px',
      margin: '4rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h1 style={{ marginTop: 0, fontSize: '1.5rem', color: '#1e293b' }}>Grant Permissions</h1>

      <p style={{ color: '#64748b' }}>
        <strong>{details.params.client_id}</strong> is requesting access to your account.
      </p>

      <div style={{ margin: '1.5rem 0' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
          Requested permissions:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: '#64748b' }}>
          {scopes.map((scope) => (
            <li key={scope}>{scope}</li>
          ))}
        </ul>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => handleConsent(false)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          Deny
        </button>
        <button
          onClick={() => handleConsent(true)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Processing...' : 'Allow Access'}
        </button>
      </div>
    </div>
  );
}
