/* eslint no-process-env: 0 */

import { google } from 'googleapis';
import { Logger } from '@eventuras/utils';

/**
 * Extracts the base and alias from an email address using plus addressing.
 * For example, given "eventurasdev+admin@gmail.com", it returns { nameSpace: "eventurasdev", tag: "admin" }.
 */
export const parseEmailAlias = (email: string) => {
  const localPart = email.split('@')[0];
  if (localPart && localPart.includes('+')) {
    const [base, alias] = localPart.split('+');
    Logger.info(
      { namespace: 'tests.utils' },
      `Parsed email "${email}" into base: "${base}" and alias: "${alias}"`
    );
    return { nameSpace: base, tag: alias };
  }
  Logger.info(
    { namespace: 'tests.utils' },
    `No plus sign found in email "${email}". Returning local part as nameSpace.`
  );
  return { nameSpace: localPart, tag: '' };
};

/**
 * Initializes the Gmail API client using OAuth2.
 * The following environment variables must be set:
 * - TEST_GMAIL_CLIENT_ID
 * - TEST_GMAIL_CLIENT_SECRET
 * - TEST_BASE_URL
 * - TEST_GMAIL_REFRESH_TOKEN (obtained via an interactive OAuth consent flow - https://developers.google.com/oauthplayground)
 */
export async function initializeGmailClient() {
  Logger.info({ namespace: 'tests.utils' }, 'Initializing Gmail API client.');

  const requiredEnvVars = [
    'TEST_GMAIL_REFRESH_TOKEN',
    'TEST_GMAIL_CLIENT_ID',
    'TEST_GMAIL_CLIENT_SECRET',
    'TEST_BASE_URL',
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing ${envVar} environment variable`);
    }
  });

  const oAuth2Client = new google.auth.OAuth2(
    process.env.TEST_GMAIL_CLIENT_ID,
    process.env.TEST_GMAIL_CLIENT_SECRET,
    process.env.TEST_BASE_URL
  );

  Logger.info({ namespace: 'tests.utils' }, 'OAuth2 client created. Setting refresh token.');
  // Set the refresh token so that the client can fetch new access tokens automatically.
  oAuth2Client.setCredentials({
    refresh_token: process.env.TEST_GMAIL_REFRESH_TOKEN,
  });

  try {
    Logger.info({ namespace: 'tests.utils' }, 'Attempting to retrieve access token...');
    const tokenResponse = await oAuth2Client.getAccessToken();
    Logger.info(
      { namespace: 'tests.utils' },
      `Access token retrieved successfully. Token length: ${tokenResponse.token?.length ?? 0})}...`
    );
    return google.gmail({ version: 'v1', auth: oAuth2Client });
  } catch (error) {
    Logger.error({ namespace: 'tests.utils' }, `Failed to initialize Gmail client: ${error}`);
    throw error;
  }
}

/**
 * Fetches the login code from the Gmail inbox for the given user email.
 * It will retry a few times if the email isn't immediately available.
 * Once a code is found, the email is deleted.
 *
 * @param userEmail - The email address to search for the verification email.
 * @param maxRetries - Maximum number of retries before giving up.
 * @returns The extracted login code.
 */
export const fetchLoginCode = async (userEmail: string, maxRetries = 10): Promise<string> => {
  Logger.info({ namespace: 'tests.utils' }, `Starting fetchLoginCode for user: ${userEmail}`);

  // Use the OAuth2 client to initialize the Gmail API client.
  const gmail = await initializeGmailClient();
  Logger.info({ namespace: 'tests.utils' }, 'Gmail client initialized.');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    Logger.info(
      { namespace: 'tests.utils' },
      `Attempt ${attempt} of ${maxRetries} for fetching login code.`
    );
    try {
      const query = `to:${userEmail} "verification code" newer_than:5m`;
      Logger.info({ namespace: 'tests.utils' }, `Executing search query: ${query}`);
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 1,
      });
      Logger.info(
        { namespace: 'tests.utils' },
        `Search response: ${response.data.messages?.length || 0} message(s) found.`
      );

      if (!response.data.messages || response.data.messages.length === 0) {
        Logger.info({ namespace: 'tests.utils' }, `No messages found on attempt ${attempt}.`);
        if (attempt === maxRetries) {
          throw new Error(
            `No verification emails received for ${userEmail} after ${maxRetries} attempts`
          );
        }
        Logger.info({ namespace: 'tests.utils' }, 'Waiting 3000ms before retrying...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      const messageId = response.data.messages[0]?.id;
      if (!messageId) {
        throw new Error('Message ID not found in search response');
      }
      Logger.info(
        { namespace: 'tests.utils' },
        `Found message with ID: ${messageId}. Fetching full message details.`
      );
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      Logger.info({ namespace: 'tests.utils' }, 'Message fetched. Checking for plain text parts.');
      // Try to find the email body; check both multipart and simple payload structures
      const emailBody =
        message.data.payload?.parts?.find(part => part.mimeType === 'text/plain')?.body?.data ||
        message.data.payload?.body?.data;

      if (!emailBody) {
        throw new Error('Email body not found');
      }

      Logger.info({ namespace: 'tests.utils' }, 'Email body found. Decoding body.');
      const decodedBody = Buffer.from(emailBody, 'base64').toString('utf-8');
      Logger.info(
        { namespace: 'tests.utils', developerOnly: true },
        `Decoded email body (partial): ${decodedBody.substring(0, 150)}...`
      );

      // Extract the login code using a regular expression. Adjust the regex if needed.
      const loginCodeMatch = RegExp(/Your verification code is: (\d+)/).exec(decodedBody);
      if (!loginCodeMatch) {
        throw new Error('No verification code found in email body');
      }
      const loginCode = loginCodeMatch[1];

      Logger.info({ namespace: 'tests.utils' }, `Login code extracted successfully.`);

      // Try to delete the email after extracting the login code.
      Logger.info(
        { namespace: 'tests.utils' },
        `Attempting to delete message with ID: ${messageId}`
      );
      try {
        await gmail.users.messages.trash({
          userId: 'me',
          id: messageId,
        });
        Logger.info(
          { namespace: 'tests.utils' },
          `Message with ID: ${messageId} deleted successfully.`
        );
      } catch (deleteError: any) {
        Logger.error(
          { namespace: 'tests.utils' },
          `Failed to delete message with ID: ${messageId}: ${deleteError.message}`
        );
      }

      if (!loginCode) {
        throw new Error('Failed to extract login code from email body');
      }
      return loginCode;
    } catch (error: any) {
      Logger.error(
        { namespace: 'tests.utils' },
        `Attempt ${attempt} failed with error: ${error.message}`
      );
      if (attempt === maxRetries) {
        Logger.error(
          { namespace: 'tests.utils' },
          `Failed to fetch login code after ${maxRetries} attempts.`
        );
        throw error;
      }
      Logger.info({ namespace: 'tests.utils' }, 'Waiting 3000ms before next attempt...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  throw new Error('Failed to fetch login code after all retries');
};
