import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { getCurrentSession } from '@eventuras/fides-auth/session';
import { redirect } from 'next/navigation';

export default async function Page() {
  if (!globalGETRateLimit()) {
    return 'Too many requests';
  }

  const { session } = await getCurrentSession();
  if (session !== null) {
    // If a session exists, redirect to home.
    redirect('/');
  }

  return (
    <>
      <h1>Sign in</h1>
      <a href="/login/auth0">Sign in with Auth0</a>
    </>
  );
}
