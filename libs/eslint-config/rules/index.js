/**
 * Custom ESLint rules for Eventuras
 */

import noInvalidTestId from './no-invalid-testid.js';
import noDirectEventSdkImport from './no-direct-event-sdk-import.js';

export default {
  rules: {
    'no-invalid-testid': noInvalidTestId,
    'no-direct-event-sdk-import': noDirectEventSdkImport,
  },
};
