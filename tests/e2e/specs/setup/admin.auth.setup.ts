import { authenticate } from '../web/helpers/auth';
import { adminEmail } from '../../utils/personas';

authenticate(adminEmail(), 'tmp/auth/admin.json');
