/* eslint no-process-env: 0 */
import dotenv from 'dotenv';

import { authenticate } from './functions';

dotenv.config();

const userName = process.env.TEST_EMAIL_ADMIN_USER;

if (!userName) {
  throw new Error('Missing TEST_EMAIL_ADMIN_USER environment variable');
}

const authFile = 'playwright-auth/admin.json';

authenticate(userName, authFile);
