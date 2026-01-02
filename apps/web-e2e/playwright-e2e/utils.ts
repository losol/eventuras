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
import { Debug } from '@eventuras/logger';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { gmail_v1 } from 'googleapis';

const debug = Debug.create('e2e:utils');

let gmailClient: gmail_v1.Gmail | null = null;

/**
 * Read refresh token from file or environment variable.
 * Priority:
 * 1. EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN env var
 * 2. test-results/.google-refresh-token file
 */
const getRefreshToken = (): string | undefined => {
  // Try environment variable first
  const envToken = process.env.EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN;
  if (envToken) {
    debug('Using refresh token from environment variable');
    return envToken;
  }

  // Try reading from file
  try {
    const tokenPath = join(process.cwd(), 'test-results', '.google-refresh-token');
    const fileToken = readFileSync(tokenPath, 'utf-8').trim();
    if (fileToken) {
      debug('Using refresh token from file: %s', tokenPath);
      return fileToken;
    }
  } catch {
    // File doesn't exist or can't be read - this is normal if using env var
    debug('No refresh token file found (this is normal if using env var)');
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

  const clientId = process.env.EVENTURAS_TEST_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.EVENTURAS_TEST_GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.EVENTURAS_TEST_GOOGLE_REDIRECT_URI;
  const authCode = process.env.EVENTURAS_TEST_GOOGLE_AUTH_CODE;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required Google OAuth credentials. Please set EVENTURAS_TEST_GOOGLE_CLIENT_ID, EVENTURAS_TEST_GOOGLE_CLIENT_SECRET, and EVENTURAS_TEST_GOOGLE_REDIRECT_URI environment variables.'
    );
  }

  debug('Initializing Gmail OAuth client...');
  const oauth2Client = createOAuthClient({
    clientId,
    clientSecret,
    redirectUri,
  });

  // If we have a refresh token stored, use it
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    debug('Using stored refresh token (first 20 chars): %s...', refreshToken.substring(0, 20));
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Log the scopes associated with this token
    try {
      const tokenInfo = await oauth2Client.getAccessToken();
      debug('Access token obtained: %s', tokenInfo.token ? 'yes' : 'no');

      // Get token info to see scopes
      const credentials = oauth2Client.credentials;
      debug('OAuth credentials - scope: %s', credentials.scope || 'not specified');
      debug('OAuth credentials - token_type: %s', credentials.token_type || 'not specified');
    } catch (error) {
      debug('Warning: Could not get token info: %s', error);
    }
  } else if (authCode) {
    // Exchange authorization code for tokens (first-time setup)
    debug('Exchanging authorization code for tokens...');
    const tokens = await exchangeCodeForTokens(oauth2Client, authCode);
    debug('Tokens obtained. Refresh token: %s', tokens.refresh_token ? 'present' : 'missing');
    if (tokens.refresh_token) {
      debug(
        'IMPORTANT: Store this refresh token in EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN env var or test-results/.google-refresh-token file: %s',
        tokens.refresh_token
      );
    }
  } else {
    throw new Error(
      'No EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN (env var or test-results/.google-refresh-token file) or EVENTURAS_TEST_GOOGLE_AUTH_CODE provided. Please complete OAuth flow first.'
    );
  }

  gmailClient = createGmailClient(oauth2Client);
  debug('Gmail client initialized successfully');
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
  debug('Fetching login code for user: %s', userEmail);

  const gmail = await initializeGmailClient();

  // Search for UNREAD verification code emails sent in the last 5 minutes
  // Gmail search results are returned in reverse chronological order (newest first)
  // is:unread ensures we only get new emails and avoid reading old verification codes
  // Search in subject OR body for "verification code" phrase
  const searchQuery = `to:${userEmail} is:unread (subject:"verification code" OR "verification code") newer_than:5m`;
  debug('Gmail search query: %s', searchQuery);
  debug('Waiting for message with maxAttempts=%d, intervalMs=%d', maxRetries, intervalMs);

  const message = await waitForMessage(gmail, {
    query: searchQuery,
    maxAttempts: maxRetries,
    intervalMs,
  });

  if (!message?.id) {
    debug('No message found after %d attempts', maxRetries);
    throw new Error(
      `No verification emails received for ${userEmail} after ${maxRetries} attempts`
    );
  }

  debug('✅ Found message with ID: %s', message.id);

  // Log message metadata
  if (message.threadId) debug('   Thread ID: %s', message.threadId);
  if (message.labelIds) debug('   Labels: %s', message.labelIds.join(', '));

  debug('Fetching full message details...');
  const fullMessage = await getMessage(gmail, { id: message.id });

  if (!fullMessage) {
    throw new Error('Failed to retrieve message details');
  }

  // Log email headers for debugging
  const headers = fullMessage.payload?.headers || [];
  const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
  const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
  const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date');

  debug('Email details:');
  debug('   From: %s', fromHeader?.value || 'unknown');
  debug('   Subject: %s', subjectHeader?.value || 'unknown');
  debug('   Date: %s', dateHeader?.value || 'unknown');
  debug('   Internal Date: %s', fullMessage.internalDate || 'unknown');

  const emailBody = getPlainTextBody(fullMessage);
  if (!emailBody) {
    throw new Error('Email body not found or could not be decoded');
  }

  debug('Email body retrieved. Extracting verification code...');

  // Log the email body for debugging (first 300 chars)
  debug('Email body preview: %s', emailBody.substring(0, 300));

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
      debug('Matched verification code with pattern: %s', pattern.source);
      break;
    }
  }

  if (!loginCode) {
    debug('Failed to match verification code in email body');
    debug('Full email body: %s', emailBody);
    throw new Error('No verification code found in email body');
  }

  debug('✅ Login code extracted successfully: %s', loginCode);

  // Trash the email after extracting the code to avoid reusing old codes
  debug('Attempting to trash email %s...', message.id);
  if (message.id) {
    try {
      await trashMessage(gmail, message.id);
      debug('✅ Successfully trashed email to prevent reuse');
    } catch (error) {
      debug('⚠️ Warning: Failed to trash email: %s', error);
      debug('   This may be due to insufficient Gmail API permissions.');
      debug('   Required scope: gmail.modify (current scope may be gmail.readonly)');
      debug('   Re-run: pnpm oauth:setup to get a new token with correct scope');
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
  debug('🧹 Cleaning up all OTP emails for: %s', userEmail);

  const gmail = await initializeGmailClient();

  // Search for all verification code emails (not just unread, not just recent)
  const searchQuery = `to:${userEmail} (subject:"verification code" OR "verification code")`;
  debug('Search query: %s', searchQuery);

  const result = await searchMessages(gmail, {
    query: searchQuery,
    maxResults: 100, // Clean up to 100 emails
  });

  const messageCount = result.messages.length;
  if (messageCount === 0) {
    debug('✅ No OTP emails found to clean up');
    return 0;
  }

  debug('Found %d OTP emails to trash:', messageCount);

  // Trash all found messages
  let trashedCount = 0;
  let failedCount = 0;

  for (const message of result.messages) {
    if (message.id) {
      try {
        await trashMessage(gmail, message.id);
        trashedCount++;
        debug('   ✅ Trashed message %d/%d (ID: %s)', trashedCount, messageCount, message.id);
      } catch (error) {
        failedCount++;
        debug('   ⚠️ Failed to trash message ID %s: %s', message.id, error);
      }
    }
  }

  debug(
    '✅ Successfully trashed %d/%d OTP emails (%d failed)',
    trashedCount,
    messageCount,
    failedCount
  );
  return trashedCount;
};
