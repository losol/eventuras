import { Router, RequestHandler } from 'express';
import { generateOtp, verifyOtp, OtpError, findOrCreateAccountByEmail } from '../services/otp';
import { Mailer } from '@eventuras/mailer';
import { createNotitiaTemplates } from '@eventuras/notitia-templates';
import { Logger } from '@eventuras/logger';
import { config } from '../config';
import { db } from '../db/client';
import { accounts } from '../db/schema';
import { eq } from 'drizzle-orm';

const logger = Logger.create({ namespace: 'idem:otp-routes' });

/**
 * Create OTP routes
 * Handles email + OTP passwordless authentication
 */
export function createOtpRoutes(mailer: Mailer): Router {
  const router = Router();
  const notitia = createNotitiaTemplates(config.locale);

  /**
   * POST /api/otp/request
   * Request an OTP code via email
   */
  router.post('/api/otp/request', (async (req, res) => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Email is required',
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Invalid email format',
        });
      }

      logger.info({ email }, 'OTP request received');

      // Find or create account
      const accountId = await findOrCreateAccountByEmail(email);

      // Generate OTP code
      const { code, expiresAt, otpId } = await generateOtp({
        recipient: email,
        recipientType: 'email',
        accountId,
        sessionId: req.sessionID,
      });

      logger.info({ email, otpId }, 'OTP code generated');

      // Render email template
      const rendered = notitia.render('email', 'otp-login', {
        appName: config.appName,
        code,
        expiresInMinutes: 10,
      });

      const subject = notitia.getSubject('email', 'otp-login', { appName: config.appName });

      // Send email
      await mailer.sendEmail({
        to: email,
        subject,
        html: rendered.content,
      });

      logger.info({ email, otpId }, 'OTP email sent');

      // Return success (don't leak whether account exists)
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive a login code shortly.',
      });
    } catch (error) {
      logger.error({ error }, 'OTP request failed');

      // Handle rate limiting errors specifically
      if (error instanceof OtpError && error.code === 'RATE_LIMITED') {
        return res.status(429).json({
          error: 'Too many requests',
          message: error.message,
        });
      }

      if (error instanceof OtpError && error.code === 'BLOCKED') {
        return res.status(429).json({
          error: 'Blocked',
          message: error.message,
        });
      }

      // Generic error (don't leak internal details)
      return res.status(500).json({
        error: 'Server error',
        message: 'Failed to send OTP code. Please try again later.',
      });
    }
  }) as RequestHandler);

  /**
   * POST /api/otp/verify
   * Verify OTP code and create session
   */
  router.post('/api/otp/verify', (async (req, res) => {
    try {
      const { email, code } = req.body;

      // Validate input
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Email is required',
        });
      }

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Code is required',
        });
      }

      logger.info({ email }, 'OTP verification requested');

      // Verify OTP
      const { otpId, accountId } = await verifyOtp({
        recipient: email,
        recipientType: 'email',
        code,
      });

      logger.info({ email, otpId, accountId }, 'OTP verified successfully');

      // Create session
      if (!req.session) {
        logger.error('Session not available');
        return res.status(500).json({
          error: 'Server error',
          message: 'Session not available',
        });
      }

      // Store account ID in session
      req.session.accountId = accountId;
      req.session.authenticatedAt = new Date().toISOString();
      req.session.authMethod = 'otp';

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      logger.info({ email, accountId, sessionId: req.sessionID }, 'Session created');

      return res.status(200).json({
        success: true,
        accountId,
      });
    } catch (error) {
      logger.error({ error }, 'OTP verification failed');

      // Handle specific OTP errors
      if (error instanceof OtpError) {
        const statusCode =
          error.code === 'RATE_LIMITED' || error.code === 'BLOCKED' ? 429 :
          error.code === 'NOT_FOUND' || error.code === 'INVALID_CODE' ? 401 :
          error.code === 'EXPIRED' ? 410 :
          error.code === 'MAX_ATTEMPTS' ? 429 :
          400;

        return res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
      }

      // Generic error
      return res.status(500).json({
        error: 'Server error',
        message: 'Verification failed. Please try again later.',
      });
    }
  }) as RequestHandler);

  /**
   * GET /api/otp/session
   * Get current session information
   */
  router.get('/api/otp/session', (async (req, res) => {
    if (!req.session || !req.session.accountId) {
      return res.status(200).json({
        authenticated: false,
        account: null,
      });
    }

    // Fetch account details
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.id, req.session.accountId),
    });

    if (!account) {
      return res.status(200).json({
        authenticated: false,
        account: null,
      });
    }

    return res.status(200).json({
      authenticated: true,
      account: {
        id: account.id,
        email: account.primaryEmail,
        displayName: account.displayName,
      },
      authenticatedAt: req.session.authenticatedAt,
      authMethod: req.session.authMethod,
    });
  }) as RequestHandler);

  /**
   * POST /api/otp/logout
   * Logout (destroy session)
   */
  router.post('/api/otp/logout', (async (req, res) => {
    if (!req.session) {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }) as RequestHandler);

  return router;
}

// Extend session type to include our custom fields
declare module 'express-session' {
  interface SessionData {
    accountId?: string | null;
    authenticatedAt?: string;
    authMethod?: 'otp' | 'idp';
  }
}
