import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';

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

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 mb-4">
      <Text className="text-red-700 dark:text-red-300 text-sm">{message}</Text>
    </div>
  );
}

function InteractionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card variant="default" className="w-full max-w-md" padding="p-8">
        {children}
      </Card>
    </div>
  );
}

export default function Interaction() {
  const { uid } = useParams<{ uid: string }>();
  const [details, setDetails] = useState<InteractionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setError('No interaction ID provided');
      setLoading(false);
      return;
    }

    fetch(`/interaction/${uid}/details`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || data.details || 'Failed to fetch interaction details');
          }).catch(jsonErr => {
            // If response is not JSON, throw generic error
            throw new Error(`HTTP ${res.status}: Failed to fetch interaction details`);
          });
        }
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
      <InteractionCard>
        <Loading />
      </InteractionCard>
    );
  }

  if (error || !details) {
    return (
      <InteractionCard>
        <Heading as="h2">Error</Heading>
        <Text>{error || 'Failed to load interaction details'}</Text>
      </InteractionCard>
    );
  }

  if (details.prompt.name === 'login') {
    return <LoginPrompt uid={uid!} details={details} />;
  }

  if (details.prompt.name === 'consent') {
    return <ConsentPrompt uid={uid!} details={details} />;
  }

  return (
    <InteractionCard>
      <Heading as="h2">Unknown Prompt</Heading>
      <Text>Prompt type: {details.prompt.name}</Text>
    </InteractionCard>
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

      // Submit login - server will respond with 302 redirect
      // We use a form submission to follow the redirect properly
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/interaction/${uid}/login`;

      const accountIdInput = document.createElement('input');
      accountIdInput.type = 'hidden';
      accountIdInput.name = 'accountId';
      accountIdInput.value = verifiedAccountId;
      form.appendChild(accountIdInput);

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <InteractionCard>
      <Heading as="h2" margin="mb-2">Sign In</Heading>

      <Text variant="muted" margin="mb-4">
        <strong>{details.params.client_id}</strong>
      </Text>

      {error && <ErrorAlert message={error} />}

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" block disabled={loading} loading={loading} margin="m-0">
            {loading ? 'Sending...' : 'Send Login Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <Text variant="muted" margin="mb-4">
            We sent a code to <strong>{email}</strong>
          </Text>

          <div className="mb-4">
            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl text-center tracking-widest"
            />
          </div>

          <Button type="submit" block disabled={loading} loading={loading} margin="m-0">
            {loading ? 'Verifying...' : 'Sign In'}
          </Button>

          <Button
            variant="text"
            block
            margin="mt-2"
            onClick={() => {
              setStep('email');
              setOtpCode('');
              setError(null);
            }}
          >
            Use a different email
          </Button>
        </form>
      )}
    </InteractionCard>
  );
}

function ConsentPrompt({ uid, details }: { uid: string; details: InteractionDetails }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async (allow: boolean) => {
    setSubmitting(true);
    setError(null);

    console.log('[Consent] Button clicked:', allow);

    try {
      // Create a form to submit the consent (server responds with 302 redirect)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = allow ? `/interaction/${uid}/consent` : `/interaction/${uid}/abort`;

      console.log('[Consent] Submitting form to:', form.action);

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error('[Consent] Error:', err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  const scopes = details.params.scope.split(' ').filter(Boolean);

  return (
    <InteractionCard>
      <Heading as="h2" margin="mb-2">Grant Permissions</Heading>

      <Text variant="muted">
        <strong>{details.params.client_id}</strong> is requesting access to your account.
      </Text>

      <div className="my-4">
        <Text className="font-semibold text-sm mb-2">Requested permissions:</Text>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {scopes.map((scope) => (
            <li key={scope}>{scope}</li>
          ))}
        </ul>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="flex gap-2">
        <Button
          variant="secondary"
          block
          disabled={submitting}
          margin="m-0"
          onClick={() => handleConsent(false)}
        >
          Deny
        </Button>
        <Button
          variant="primary"
          block
          disabled={submitting}
          loading={submitting}
          margin="m-0"
          onClick={() => handleConsent(true)}
        >
          {submitting ? 'Processing...' : 'Allow Access'}
        </Button>
      </div>
    </InteractionCard>
  );
}
