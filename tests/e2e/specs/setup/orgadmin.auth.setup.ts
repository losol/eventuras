import { authenticate } from '../web/helpers/auth';
import { orgAdminEmail } from '../../utils/personas';

authenticate(orgAdminEmail(), 'tmp/auth/orgadmin.json');
