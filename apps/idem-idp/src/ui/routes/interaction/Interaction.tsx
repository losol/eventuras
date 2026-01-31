import { useParams } from 'react-router-dom';
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
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verify OTP
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.message || 'Invalid code');
      }

      const { accountId: verifiedAccountId } = await verifyRes.json();

      // Complete OIDC login with the verified account ID
      const loginRes = await fetch(`/interaction/${uid}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountId: verifiedAccountId }),
      });

      if (!loginRes.ok) {
        throw new Error('Login failed');
      }

      // OIDC provider will redirect - follow it
      window.location.href = loginRes.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#93c5fd' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            We sent a code to <strong>{email}</strong>
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="otpCode" style={{ display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
              Login Code
            </label>
            <input
              id="otpCode"
              name="otpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              required
              autoFocus
              autoComplete="one-time-code"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1.25rem',
                textAlign: 'center',
                letterSpacing: '0.25em',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#93c5fd' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setOtpCode('');
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.5rem',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Use a different email
          </button>
        </form>
      )}
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

      // Follow the redirect from the OIDC provider
      window.location.href = res.url;
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
