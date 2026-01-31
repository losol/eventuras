import type { FastifyPluginAsync } from 'fastify';
import { generateOtp, verifyOtp, OtpError, findOrCreateAccountByEmail } from '../services/otp';
import { Mailer } from '@eventuras/mailer';
import { createNotitiaTemplates, type Locale } from '@eventuras/notitia-templates';
import { Logger } from '@eventuras/logger';
import { config } from '../config';
import { db } from '../db/client';
import { accounts } from '../db/schema/account';
import { eq } from 'drizzle-orm';

const logger = Logger.create({ namespace: 'idem:otp-routes' });

interface OtpRoutesOptions {
  mailer: Mailer;
}

interface OtpRequestBody {
  email: string;
}

interface OtpVerifyBody {
  email: string;
  code: string;
}

/**
 * OTP routes plugin
 * Handles email + OTP passwordless authentication
 */
export const registerOtpRoutes: FastifyPluginAsync<OtpRoutesOptions> = async (fastify, opts) => {
  const { mailer } = opts;
  const notitia = createNotitiaTemplates(config.locale as Locale);

  /**
   * POST /api/otp/request
   * Request an OTP code via email
   */
  fastify.post<{ Body: OtpRequestBody }>('/api/otp/request', async (request, reply) => {
    try {
      const { email } = request.body;

      // Validate email
      if (!email || typeof email !== 'string') {
        return reply.code(400).send({
          error: 'Invalid request',
          message: 'Email is required',
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.code(400).send({
          error: 'Invalid request',
          message: 'Invalid email format',
        });
      }

      logger.info({ email }, 'OTP request received');

      // Find or create account
      const accountId = await findOrCreateAccountByEmail(email);

      // Generate OTP code
      const { code, otpId } = await generateOtp({
        recipient: email,
        recipientType: 'email',
        accountId,
        sessionId: request.session.sessionId,
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
      return reply.code(200).send({
        success: true,
        message: 'If this email is registered, you will receive a login code shortly.',
      });
    } catch (error) {
      logger.error({ error }, 'OTP request failed');

      // Handle rate limiting errors specifically
      if (error instanceof OtpError && error.code === 'RATE_LIMITED') {
        return reply.code(429).send({
          error: 'Too many requests',
          message: error.message,
        });
      }

      if (error instanceof OtpError && error.code === 'BLOCKED') {
        return reply.code(429).send({
          error: 'Blocked',
          message: error.message,
        });
      }

      // Generic error (don't leak internal details)
      return reply.code(500).send({
        error: 'Server error',
        message: 'Failed to send OTP code. Please try again later.',
      });
    }
  });

  /**
   * POST /api/otp/verify
   * Verify OTP code and create session
   */
  fastify.post<{ Body: OtpVerifyBody }>('/api/otp/verify', async (request, reply) => {
    try {
      const { email, code } = request.body;

      // Validate input
      if (!email || typeof email !== 'string') {
        return reply.code(400).send({
          error: 'Invalid request',
          message: 'Email is required',
        });
      }

      if (!code || typeof code !== 'string') {
        return reply.code(400).send({
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

      // Store account ID in session
      request.session.set('accountId', accountId);
      request.session.set('authenticatedAt', new Date().toISOString());
      request.session.set('authMethod', 'otp');
      await request.session.save();

      logger.info({ email, accountId, sessionId: request.session.sessionId }, 'Session created');

      return reply.code(200).send({
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

        return reply.code(statusCode).send({
          error: error.code,
          message: error.message,
        });
      }

      // Generic error
      return reply.code(500).send({
        error: 'Server error',
        message: 'Verification failed. Please try again later.',
      });
    }
  });

  /**
   * GET /api/otp/session
   * Get current session information
   */
  fastify.get('/api/otp/session', async (request, reply) => {
    const accountId = request.session.get('accountId');

    if (!accountId) {
      return reply.code(200).send({
        authenticated: false,
        account: null,
      });
    }

    // Fetch account details
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (!account) {
      return reply.code(200).send({
        authenticated: false,
        account: null,
      });
    }

    return reply.code(200).send({
      authenticated: true,
      account: {
        id: account.id,
        email: account.primaryEmail,
        displayName: account.displayName,
      },
      authenticatedAt: request.session.get('authenticatedAt'),
      authMethod: request.session.get('authMethod'),
    });
  });

  /**
   * POST /api/otp/logout
   * Logout (destroy session)
   */
  fastify.post('/api/otp/logout', async (request, reply) => {
    await request.session.destroy();

    return reply.code(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  });
};
