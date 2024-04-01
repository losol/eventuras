import { Logger } from '@eventuras/utils';
import NextAuth from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';

Logger.info({ namespace: 'auth', developerOnly: true }, authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
