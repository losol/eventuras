'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Stack } from '@eventuras/ratio-ui/layout/Stack';

type ConsentPageProps = {
  uid: string;
  clientId: string;
  clientName: string;
  scope: string;
  claims: string[];
};

export function ConsentPage({ uid, clientId, clientName, scope, claims }: ConsentPageProps) {
  const t = useTranslations('auth.consent');
  const [loading, setLoading] = useState(false);

  const scopes = scope.split(' ').filter(Boolean);

  const handleConsent = async (grant: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/interaction/${uid}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectedScopes: grant ? [] : scopes,
          rejectedClaims: grant ? [] : claims,
        }),
      });

      if (response.ok) {
        // OIDC provider will redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.reload();
      } else {
        console.error('Consent failed:', await response.text());
        setLoading(false);
      }
    } catch (error) {
      console.error('Consent error:', error);
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
            <Text color="muted">
              {t('description', { clientName: clientName || clientId })}
            </Text>
          </div>

          <div>
            <Text weight="bold" style={{ marginBottom: '0.75rem' }}>
              {t('scopes')}
            </Text>
            <Stack spacing="sm">
              {scopes.map(scope => (
                <div
                  key={scope}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Text size="sm">
                    <strong>{scope}</strong>
                  </Text>
                  <Text size="xs" color="muted">
                    {getScopeDescription(scope, t)}
                  </Text>
                </div>
              ))}
            </Stack>
          </div>

          <Stack spacing="sm">
            <Button
              onClick={() => handleConsent(true)}
              disabled={loading}
              fullWidth
              size="lg"
              variant="primary"
            >
              {loading ? t('common.loading') : t('allow')}
            </Button>
            <Button
              onClick={() => handleConsent(false)}
              disabled={loading}
              fullWidth
              size="lg"
              variant="secondary"
            >
              {t('deny')}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}

function getScopeDescription(scope: string, t: any): string {
  const descriptions: Record<string, string> = {
    openid: 'Basic authentication information',
    profile: 'Your profile information (name, picture)',
    email: 'Your email address',
    offline_access: 'Access when you are offline (refresh tokens)',
  };
  return descriptions[scope] || `Access to ${scope}`;
}
