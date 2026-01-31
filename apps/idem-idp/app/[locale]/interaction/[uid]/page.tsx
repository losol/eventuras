import { LoginPage } from './login-page';
import { ConsentPage } from './consent-page';
import { cookies } from 'next/headers';

type Props = {
  params: Promise<{ uid: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getInteractionDetails(uid: string) {
  // Server-side fetch to interaction API
  // Use localhost in development, environment variable in production
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200';

  try {
    // Forward cookies from the request to maintain OIDC session
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const response = await fetch(`${baseUrl}/interaction/${uid}/details`, {
      cache: 'no-store', // Don't cache interaction details
      headers: {
        Cookie: cookieHeader, // Forward cookies for OIDC session
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch interaction details: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch interaction details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching interaction details:', error);
    // Return fallback data to prevent complete failure
    // In production, this should redirect to an error page
    return {
      prompt: { name: 'login' },
      params: {
        client_id: 'unknown',
        scope: 'openid',
      },
      session: null,
    };
  }
}

export default async function InteractionPage({ params, searchParams }: Props) {
  const { uid } = await params;
  const details = await getInteractionDetails(uid);

  if (details.prompt.name === 'login') {
    return (
      <LoginPage
        uid={uid}
        clientId={details.params.client_id}
        scope={details.params.scope}
      />
    );
  }

  if (details.prompt.name === 'consent') {
    return (
      <ConsentPage
        uid={uid}
        clientId={details.params.client_id}
        clientName={details.params.client_id}
        scope={details.params.scope}
        claims={[]}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p>Unknown interaction prompt: {details.prompt.name}</p>
    </div>
  );
}
