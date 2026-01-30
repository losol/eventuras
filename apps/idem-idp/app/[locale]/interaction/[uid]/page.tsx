import { LoginPage } from './login-page';
import { ConsentPage } from './consent-page';

type Props = {
  params: Promise<{ uid: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getInteractionDetails(uid: string) {
  // In production, this would call the interaction API
  // For now, we'll use placeholder data
  return {
    prompt: { name: 'login' },
    params: {
      client_id: 'dev_web_app',
      scope: 'openid profile email',
    },
    session: null,
  };
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
