import { authenticate } from '../web/helpers/auth';
import { newRegularEmail } from '../../utils/personas';

authenticate(newRegularEmail(), 'tmp/auth/user.json');
