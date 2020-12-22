import { withAuthenticationRequired } from '@auth0/auth0-react';
import Events from '../src/views/Events'

export default withAuthenticationRequired(Events);