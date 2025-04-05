import { redirect } from 'next/navigation';

import { globalGETRateLimit } from '@/lib/auth/request';
import { getCurrentSession } from '@/lib/auth/session';

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
