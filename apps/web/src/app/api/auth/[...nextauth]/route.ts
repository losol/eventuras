import NextAuth from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';
import Logger from '@/utils/Logger';

Logger.info({ namespace: 'auth', developerOnly: true }, authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
