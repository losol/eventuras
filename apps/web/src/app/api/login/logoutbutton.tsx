import { useActionState } from 'react';
('use client');

import { logoutAction } from './actions';

const initialState = {
  message: '',
};

export function LogoutButton() {
  const [, action] = useActionState(logoutAction, initialState);
  return (
    <form action={action}>
      <button>Sign out</button>
    </form>
  );
}
