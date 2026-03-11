/* eslint no-process-env: 0 */

import { authenticate } from '../web/helpers/auth';

const baseEmail = process.env.E2E_BASE_EMAIL;
if (!baseEmail) {
  throw new Error('E2E_BASE_EMAIL must be set');
}

const [localPart, domain] = baseEmail.split('@');
const userName = `${localPart}+user@${domain}`;
const authFile = 'playwright-auth/user.json';

authenticate(userName, authFile);
