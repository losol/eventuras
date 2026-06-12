import { authenticate } from '../web/helpers/auth';
import { systemAdminEmail } from '../../utils/personas';

authenticate(systemAdminEmail(), 'tmp/auth/systemadmin.json');
