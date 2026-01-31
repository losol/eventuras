'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

type LoginPageProps = {
  uid: string;
  clientId: string;
  scope: string;
};

export function LoginPage({ uid, clientId, scope }: LoginPageProps) {
  const t = useTranslations('auth.login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/interaction/${uid}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Dev mode: auto-select test account
          accountId: 'dev-test-account',
        }),
      });

      if (response.ok) {
        // OIDC provider will redirect - wait for it
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
        setError(t('error'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('error'));
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, #0f172a 0%, #1e293b 50%, #020617 100%)',
      padding: '2rem',
    }}>
      <Card style={{ maxWidth: '28rem', width: '100%' }}>
        <Stack spacing="lg">
          <div style={{ textAlign: 'center' }}>
            <Heading level={1}>{t('title')}</Heading>
            <Text color="muted">{t('description')}</Text>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            <Text size="sm" style={{ marginBottom: '0.5rem' }}>
              <strong>Application:</strong> {clientId}
            </Text>
            <Text size="sm">
              <strong>Requested scopes:</strong> {scope}
            </Text>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.375rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <Text size="sm" style={{ color: 'rgb(239, 68, 68)' }}>
                {error}
              </Text>
            </div>
          )}

          <Button
            onClick={handleDevLogin}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {loading ? t('loading') : t('devLogin')}
          </Button>

          <Text size="xs" color="muted" style={{ textAlign: 'center' }}>
            Development mode - production will show real login options
          </Text>
        </Stack>
      </Card>
    </div>
  );
}
