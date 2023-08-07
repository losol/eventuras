'use client';

import { UserProvider } from 'context';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

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
        <UserProvider>{children}</UserProvider>
      </SessionProvider>
      <Toaster richColors closeButton />
      {/*<TailwindIndicator />*/}
    </ThemeProvider>
  );
}
