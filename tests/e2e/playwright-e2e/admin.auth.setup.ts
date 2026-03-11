/* eslint no-process-env: 0 */

import { authenticate } from './functions';

const baseEmail = process.env.EVENTURAS_TEST_BASE_EMAIL;
if (!baseEmail) {
  throw new Error('EVENTURAS_TEST_BASE_EMAIL must be set');
}

const [localPart, domain] = baseEmail.split('@');
const userName = `${localPart}+admin@${domain}`;
const authFile = 'playwright-auth/admin.json';

authenticate(userName, authFile);
