/* eslint no-process-env: 0 */
import dotenv from 'dotenv';

import { authenticate } from './functions';

dotenv.config();

const userName = process.env.TEST_E2E_EMAIL_USER!;
const authFile = 'playwright-auth/user.json';

authenticate(userName, authFile);
