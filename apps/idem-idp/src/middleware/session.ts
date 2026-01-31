import session from 'express-session';
import { DrizzleSessionStore } from './drizzle-session-store';
import { config } from '../config';

/**
 * Create express-session middleware with Drizzle session store
 */
export function createSessionMiddleware() {
  return session({
    store: new DrizzleSessionStore(),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    name: 'idem.sid',
    rolling: true, // Extend session expiry on each request
  });
}
