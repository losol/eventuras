/* eslint no-process-env: 0 */

import {
  createGmailClient,
  createOAuthClient,
  exchangeCodeForTokens,
  getMessage,
  getPlainTextBody,
  searchMessages,
  trashMessage,
  waitForMessage,
} from '@eventuras/google-api';
import { Logger } from '@eventuras/logger';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { gmail_v1 } from 'googleapis';

const logger = Logger.create({ namespace: 'e2e:utils' });

let gmailClient: gmail_v1.Gmail | null = null;

/**
 * Read refresh token from file or environment variable.
 * Priority:
 * 1. E2E_GMAIL_REFRESH_TOKEN env var
 * 2. test-results/.google-refresh-token file
 */
const getRefreshToken = (): string | undefined => {
  // Try environment variable first
  const envToken = process.env.E2E_GMAIL_REFRESH_TOKEN;
  if (envToken) {
    logger.debug('Using refresh token from environment variable');
    return envToken;
  }

  // Try reading from file
  try {
    const tokenPath = join(process.cwd(), 'test-results', '.google-refresh-token');
    const fileToken = readFileSync(tokenPath, 'utf-8').trim();
    if (fileToken) {
      logger.debug({ tokenPath }, 'Using refresh token from file');
      return fileToken;
    }
  } catch {
    // File doesn't exist or can't be read - this is normal if using env var
    logger.debug('No refresh token file found (this is normal if using env var)');
  }

  return undefined;
};

/**
 * Initialize Gmail client using OAuth2 credentials from environment variables.
 * Reuses the same client instance for subsequent calls.
 */
export const initializeGmailClient = async (): Promise<gmail_v1.Gmail> => {
  if (gmailClient) {
    return gmailClient;
  }

  const clientId = process.env.E2E_GMAIL_CLIENT_ID;
  const clientSecret = process.env.E2E_GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.E2E_GMAIL_REDIRECT_URI;
  const authCode = process.env.E2E_GMAIL_AUTH_CODE;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required Google OAuth credentials. Please set E2E_GMAIL_CLIENT_ID, E2E_GMAIL_CLIENT_SECRET, and E2E_GMAIL_REDIRECT_URI environment variables.'
    );
  }

  logger.debug('Initializing Gmail OAuth client...');
  const oauth2Client = createOAuthClient({
    clientId,
    clientSecret,
    redirectUri,
  });

  // If we have a refresh token stored, use it
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    logger.debug({ tokenPrefix: refreshToken.substring(0, 20) }, 'Using stored refresh token');
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Log the scopes associated with this token
    try {
      const tokenInfo = await oauth2Client.getAccessToken();
      logger.debug({ hasToken: tokenInfo.token ? 'yes' : 'no' }, 'Access token obtained');

      // Get token info to see scopes
      const credentials = oauth2Client.credentials;
      logger.debug({ scope: credentials.scope || 'not specified' }, 'OAuth credentials - scope');
      logger.debug({ tokenType: credentials.token_type || 'not specified' }, 'OAuth credentials - token_type');
    } catch (error) {
      logger.debug({ error }, 'Warning: Could not get token info');
    }
  } else if (authCode) {
    // Exchange authorization code for tokens (first-time setup)
    logger.debug('Exchanging authorization code for tokens...');
    const tokens = await exchangeCodeForTokens(oauth2Client, authCode);
    logger.debug({ refreshToken: tokens.refresh_token ? 'present' : 'missing' }, 'Tokens obtained');
    if (tokens.refresh_token) {
      logger.info(
        'IMPORTANT: Store the refresh token in E2E_GMAIL_REFRESH_TOKEN env var or test-results/.google-refresh-token file'
      );
    }
  } else {
    throw new Error(
      'No E2E_GMAIL_REFRESH_TOKEN (env var or test-results/.google-refresh-token file) or E2E_GMAIL_AUTH_CODE provided. Please complete OAuth flow first.'
    );
  }

  gmailClient = createGmailClient(oauth2Client);
  logger.debug('Gmail client initialized successfully');
  return gmailClient;
};

/**
 * Fetches login/verification code from Gmail inbox.
 * @param userEmail - The email address to search for verification emails
 * @param maxRetries - Maximum number of polling attempts (default: 20)
 * @param intervalMs - Milliseconds between retry attempts (default: 5000)
 */
export const fetchLoginCode = async (
  userEmail: string,
  maxRetries = 20,
  intervalMs = 3000
): Promise<string> => {
  logger.debug({ userEmail }, 'Fetching login code for user');

  const gmail = await initializeGmailClient();

  // Search for UNREAD verification code emails sent in the last 5 minutes
  // Gmail search results are returned in reverse chronological order (newest first)
  // is:unread ensures we only get new emails and avoid reading old verification codes
  // Search in subject OR body for "verification code" phrase
  const searchQuery = `to:${userEmail} is:unread (subject:"verification code" OR "verification code") newer_than:5m`;
  logger.debug({ searchQuery }, 'Gmail search query');
  logger.debug({ maxAttempts: maxRetries, intervalMs }, 'Waiting for message');

  const message = await waitForMessage(gmail, {
    query: searchQuery,
    maxAttempts: maxRetries,
    intervalMs,
  });

  if (!message?.id) {
    logger.debug({ maxRetries }, 'No message found after attempts');
    throw new Error(
      `No verification emails received for ${userEmail} after ${maxRetries} attempts`
    );
  }

  logger.debug({ messageId: message.id }, 'Found message');

  // Log message metadata
  if (message.threadId) logger.debug({ threadId: message.threadId }, 'Thread ID');
  if (message.labelIds) logger.debug({ labels: message.labelIds.join(', ') }, 'Labels');

  logger.debug('Fetching full message details...');
  const fullMessage = await getMessage(gmail, { id: message.id });

  if (!fullMessage) {
    throw new Error('Failed to retrieve message details');
  }

  // Log email headers for debugging
  const headers = fullMessage.payload?.headers || [];
  const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
  const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
  const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');

  logger.debug({
    from: fromHeader?.value || 'unknown',
    subject: subjectHeader?.value || 'unknown',
    date: dateHeader?.value || 'unknown',
    internalDate: fullMessage.internalDate || 'unknown',
  }, 'Email details');

  const emailBody = getPlainTextBody(fullMessage);
  if (!emailBody) {
    throw new Error('Email body not found or could not be decoded');
  }

  logger.debug('Email body retrieved. Extracting verification code...');

  // Log the email body for debugging (first 300 chars)
  logger.debug({ bodyPreview: emailBody.substring(0, 300) }, 'Email body preview');

  // Extract the login code using multiple regex patterns
  // Pattern 1: "Your verification code is: 123456"
  // Pattern 2: "verification code is: 123456" (more lenient)
  // Pattern 3: Any 6-digit code after "code" (fallback)
  const patterns = [
    /Your verification code is:\s*(\d{6})/i,
    /verification code is:\s*(\d{6})/i,
    /code\s*(?:is)?:?\s*(\d{6})/i,
  ];

  let loginCode: string | null = null;
  for (const pattern of patterns) {
    const match = pattern.exec(emailBody);
    if (match?.[1]) {
      loginCode = match[1];
      logger.debug({ pattern: pattern.source }, 'Matched verification code with pattern');
      break;
    }
  }

  if (!loginCode) {
    logger.debug('Failed to match verification code in email body');
    throw new Error('No verification code found in email body');
  }

  logger.debug('Login code extracted successfully');

  // Trash the email after extracting the code to avoid reusing old codes
  logger.debug({ messageId: message.id }, 'Attempting to trash email...');
  if (message.id) {
    try {
      await trashMessage(gmail, message.id);
      logger.debug('Successfully trashed email to prevent reuse');
    } catch (error) {
      logger.debug({ error }, 'Warning: Failed to trash email');
      logger.debug('This may be due to insufficient Gmail API permissions.');
      logger.debug('Required scope: gmail.modify (current scope may be gmail.readonly)');
      logger.debug('Re-run: pnpm oauth:setup to get a new token with correct scope');
    }
  }

  return loginCode;
};

/**
 * Cleans up all OTP/verification code emails for a specific user.
 * Useful to run before test suites to ensure a clean state.
 *
 * @param userEmail - The email address to clean up verification emails for
 * @returns Number of emails trashed
 */
export const cleanupOtpEmails = async (userEmail: string): Promise<number> => {
  logger.debug({ userEmail }, 'Cleaning up all OTP emails');

  const gmail = await initializeGmailClient();

  // Search for all verification code emails (not just unread, not just recent)
  const searchQuery = `to:${userEmail} (subject:"verification code" OR "verification code")`;
  logger.debug({ searchQuery }, 'Search query');

  const result = await searchMessages(gmail, {
    query: searchQuery,
    maxResults: 100, // Clean up to 100 emails
  });

  const messageCount = result.messages.length;
  if (messageCount === 0) {
    logger.debug('No OTP emails found to clean up');
    return 0;
  }

  logger.debug({ messageCount }, 'Found OTP emails to trash');

  // Trash all found messages
  let trashedCount = 0;
  let failedCount = 0;

  for (const message of result.messages) {
    if (message.id) {
      try {
        await trashMessage(gmail, message.id);
        trashedCount++;
        logger.debug({ trashedCount, messageCount, messageId: message.id }, 'Trashed message');
      } catch (error) {
        failedCount++;
        logger.debug({ error, messageId: message.id }, 'Failed to trash message');
      }
    }
  }

  logger.debug({ trashedCount, messageCount, failedCount }, 'OTP email cleanup complete');
  return trashedCount;
};
