import { Meta, StoryFn } from '@storybook/react-vite';
import { SessionWarning, SessionWarningProps } from './SessionWarning';
import { fn } from 'storybook/test';
import { useState } from 'react';

const meta: Meta<typeof SessionWarning> = {
  component: SessionWarning,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onLoginNow: fn(),
    onDismiss: fn(),
    isLoading: false,
  },
};

export default meta;

type SessionWarningStory = StoryFn<SessionWarningProps>;

const defaultMessages = {
  title: 'Session Expired',
  description: 'Your session has expired. Please log in again to continue.',
  tip: 'Make sure to save your work before logging in.',
  loginButton: 'Log In Now',
  dismissButton: 'Dismiss',
};

export const Playground: SessionWarningStory = args => <SessionWarning {...args} />;

export const SessionExpired: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SessionWarning
      isOpen={isOpen}
      onLoginNow={() => console.log('Login now clicked')}
      onDismiss={() => setIsOpen(false)}
      messages={defaultMessages}
    />
  );
};

export const WithoutTip: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SessionWarning
      isOpen={isOpen}
      onLoginNow={() => console.log('Login now clicked')}
      onDismiss={() => setIsOpen(false)}
      messages={{
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        loginButton: 'Log In',
        dismissButton: 'Dismiss',
      }}
    />
  );
};

export const Loading: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SessionWarning
      isOpen={isOpen}
      onLoginNow={() => console.log('Login now clicked')}
      onDismiss={() => setIsOpen(false)}
      isLoading
      messages={defaultMessages}
    />
  );
};

export const SessionExpiringSoon: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SessionWarning
      isOpen={isOpen}
      onLoginNow={() => console.log('Login now clicked')}
      onDismiss={() => setIsOpen(false)}
      messages={{
        title: 'Session Expiring Soon',
        description: 'Your session will expire in 5 minutes. Please save your work.',
        tip: 'Click "Refresh Session" to extend your session without losing your work.',
        loginButton: 'Refresh Session',
        dismissButton: 'Continue Working',
      }}
    />
  );
};

export const Interactive: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginNow = async () => {
    setIsLoading(true);
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsOpen(false);
    console.log('Logged in successfully');
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Trigger Session Warning
      </button>
      <SessionWarning
        isOpen={isOpen}
        onLoginNow={handleLoginNow}
        onDismiss={() => setIsOpen(false)}
        isLoading={isLoading}
        messages={defaultMessages}
      />
    </div>
  );
};

export const Norwegian: SessionWarningStory = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SessionWarning
      isOpen={isOpen}
      onLoginNow={() => console.log('Logg inn nå klikket')}
      onDismiss={() => setIsOpen(false)}
      messages={{
        title: 'Økt utløpt',
        description: 'Din økt har utløpt. Vennligst logg inn på nytt for å fortsette.',
        tip: 'Husk å lagre arbeidet ditt før du logger inn.',
        loginButton: 'Logg inn nå',
        dismissButton: 'Avvis',
      }}
    />
  );
};
