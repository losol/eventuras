import { test as setup } from '@playwright/test';

import { authenticate } from '../web/helpers/auth';
import { ORG_ADMIN_SKIP_REASON, orgAdminEmail } from '../../utils/personas';

const email = orgAdminEmail();

if (email) {
  authenticate(email, 'tmp/auth/orgadmin.json');
} else {
  setup('authenticate', () => setup.skip(true, ORG_ADMIN_SKIP_REASON));
}
