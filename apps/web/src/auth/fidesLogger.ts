import type { FidesLoggerFactory } from '@eventuras/fides-auth';
import { Logger } from '@eventuras/logger';

/** Routes fides-auth's logs through @eventuras/logger, on the server and in the browser. */
export const fidesLogger: FidesLoggerFactory = {
  create: options => Logger.create(options),
};
