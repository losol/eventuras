'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { globalPOSTRateLimit } from '@eventuras/fides-auth-next/request';

import { auth } from '@/utils/auth/fidesAuth';

export async function logoutAction(): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: 'Too many requests',
    };
  }
  const session = await auth.getCurrentSession();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }

  (await cookies()).delete('session');

  return redirect('/');
}

interface ActionResult {
  message: string;
}
