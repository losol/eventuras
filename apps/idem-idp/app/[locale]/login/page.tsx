'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Input } from '@eventuras/ratio-ui/forms/Input';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Panel } from '@eventuras/ratio-ui/core/Panel';

type Step = 'email' | 'code' | 'success';

export default function LoginPage() {
  const t = useTranslations('auth.otp');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Email step: request OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited
          const match = data.message?.match(/(\d+)\s+minutes?/i);
          const minutes = match ? match[1] : '60';
          setError(t('emailStep.rateLimited', { minutes }));
        } else {
          setError(data.message || t('emailStep.error'));
        }
        return;
      }

      // Success - move to code step
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
      }
      setStep('code');
    } catch (err) {
      setError(t('emailStep.error'));
    } finally {
      setLoading(false);
    }
  };

  // Code step: verify OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 410) {
          setError(t('codeStep.expired'));
        } else if (response.status === 429) {
          setError(t('codeStep.maxAttempts'));
        } else {
          setError(data.message || t('codeStep.error'));
        }
        return;
      }

      // Success!
      setStep('success');

      // Redirect to home or dashboard after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(t('codeStep.error'));
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    setCode('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('emailStep.error'));
        return;
      }

      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
      }
    } catch (err) {
      setError(t('emailStep.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendCode}>
            <Stack spacing="lg">
              <Heading level={1}>{t('emailStep.title')}</Heading>
              <Text>{t('emailStep.description')}</Text>

              {error && <Panel variant="alert" intent="error">{error}</Panel>}

              <Input
                type="email"
                label={t('emailStep.emailLabel')}
                placeholder={t('emailStep.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !email}
              >
                {loading ? t('emailStep.sending') : t('emailStep.sendCode')}
              </Button>
            </Stack>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <Stack spacing="lg">
              <Heading level={1}>{t('codeStep.title')}</Heading>
              <Text>{t('codeStep.description', { email })}</Text>

              {error && <Panel variant="alert" intent="error">{error}</Panel>}

              {expiresAt && (
                <Panel variant="alert" intent="info">
                  {t('codeStep.expiresIn', {
                    minutes: Math.ceil((expiresAt.getTime() - Date.now()) / 60000)
                  })}
                </Panel>
              )}

              <Input
                type="text"
                label={t('codeStep.codeLabel')}
                placeholder={t('codeStep.codePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                disabled={loading}
                maxLength={6}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading || code.length !== 6}
              >
                {loading ? t('codeStep.verifying') : t('codeStep.verify')}
              </Button>

              <Stack spacing="sm">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {t('codeStep.resend')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setStep('email'); setCode(''); setError(null); }}
                  disabled={loading}
                >
                  {t('codeStep.changeEmail')}
                </Button>
              </Stack>
            </Stack>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Stack spacing="lg" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem' }}>✅</div>
            <Heading level={1}>Success!</Heading>
            <Text>Redirecting...</Text>
          </Stack>
        )}
      </Card>
    </div>
  );
}
