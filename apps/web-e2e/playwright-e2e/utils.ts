/* eslint no-process-env: 0 */

import {
  createGmailClient,
  createOAuthClient,
  exchangeCodeForTokens,
  getMessage,
  getPlainTextBody,
  waitForMessage,
} from '@eventuras/google-api';
import { Debug } from '@eventuras/logger';
import type { gmail_v1 } from 'googleapis';

const debug = Debug.create('e2e:utils');

let gmailClient: gmail_v1.Gmail | null = null;

/**
 * Initialize Gmail client using OAuth2 credentials from environment variables.
 * Reuses the same client instance for subsequent calls.
 */
export const initializeGmailClient = async (): Promise<gmail_v1.Gmail> => {
  if (gmailClient) {
    return gmailClient;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const authCode = process.env.GOOGLE_AUTH_CODE;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required Google OAuth credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.'
    );
  }

  debug('Initializing Gmail OAuth client...');
  const oauth2Client = createOAuthClient({
    clientId,
    clientSecret,
    redirectUri,
  });

  // If we have a refresh token stored, use it
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken) {
    debug('Using stored refresh token');
    oauth2Client.setCredentials({ refresh_token: refreshToken });
  } else if (authCode) {
    // Exchange authorization code for tokens (first-time setup)
    debug('Exchanging authorization code for tokens...');
    const tokens = await exchangeCodeForTokens(oauth2Client, authCode);
    debug('Tokens obtained. Refresh token: %s', tokens.refresh_token ? 'present' : 'missing');
    if (tokens.refresh_token) {
      debug(
        'IMPORTANT: Store this refresh token in GOOGLE_REFRESH_TOKEN env var: %s',
        tokens.refresh_token
      );
    }
  } else {
    throw new Error(
      'No GOOGLE_REFRESH_TOKEN or GOOGLE_AUTH_CODE provided. Please complete OAuth flow first.'
    );
  }

  gmailClient = createGmailClient(oauth2Client);
  debug('Gmail client initialized successfully');
  return gmailClient;
};

/**
 * Fetches login/verification code from Gmail inbox.
 * @param userEmail - The email address to search for verification emails
 * @param maxRetries - Maximum number of polling attempts (default: 10)
 * @param intervalMs - Milliseconds between retry attempts (default: 3000)
 */
export const fetchLoginCode = async (
  userEmail: string,
  maxRetries = 10,
  intervalMs = 3000
): Promise<string> => {
  debug('Fetching login code for user: %s', userEmail);

  const gmail = await initializeGmailClient();

  const message = await waitForMessage(gmail, {
    query: `to:${userEmail} "verification code" newer_than:5m`,
    maxAttempts: maxRetries,
    intervalMs,
  });

  if (!message?.id) {
    throw new Error(`No verification emails received for ${userEmail} after ${maxRetries} attempts`);
  }

  debug('Found message with ID: %s. Fetching full message details.', message.id);
  const fullMessage = await getMessage(gmail, { id: message.id });

  if (!fullMessage) {
    throw new Error('Failed to retrieve message details');
  }

  const emailBody = getPlainTextBody(fullMessage);
  if (!emailBody) {
    throw new Error('Email body not found or could not be decoded');
  }

  debug('Email body retrieved. Extracting verification code...');

  // Extract the login code using regex (adjust if your email format differs)
  const loginCodeMatch = /Your verification code is: (\d+)/.exec(emailBody);
  if (!loginCodeMatch?.[1]) {
    throw new Error('No verification code found in email body');
  }

  const loginCode = loginCodeMatch[1];
  debug('Login code extracted successfully');

  return loginCode;
};

