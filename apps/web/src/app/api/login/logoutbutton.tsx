'use client';

import { useFormState } from 'react-dom';

import { logoutAction } from './actions';

const initialState = {
  message: '',
};

export function LogoutButton() {
  const [, action] = useFormState(logoutAction, initialState);
  return (
    <form action={action}>
      <button>Sign out</button>
    </form>
  );
}
