'use client';

//import { Notifications } from '@mantine/notifications';
import { UserProvider } from 'context';
import { SessionProvider } from 'next-auth/react';

//import TailwindIndicator from '@/components/TailwindIndicator';
import ThemeProvider from '@/components/ThemeProvider';

type ProvidersProps = {
  session: any;
  children: React.ReactNode;
};

export default function Providers({ session, children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        {/*<Notifications />*/}
        <UserProvider>{children}</UserProvider>
      </SessionProvider>
      {/*<TailwindIndicator />*/}
    </ThemeProvider>
  );
}
