import { globalGETRateLimit } from '@eventuras/fides-auth/request';
import { getCurrentSession } from '@eventuras/fides-auth/session';
import { redirect } from 'next/navigation';

export default async function Page() {
  if (!globalGETRateLimit()) {
    return 'Too many requests';
  }
  const { user } = await getCurrentSession();
  if (user !== null) {
    return redirect('/');
  }
  return (
    <>
      <h1>Sign in</h1>
      <a href="/login/auth0">Sign in with Auth0</a>
    </>
  );
}
