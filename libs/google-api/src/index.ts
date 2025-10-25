export {
  createOAuthClient,
  generateOAuthConsentUrl,
  exchangeCodeForTokens,
  refreshOAuthToken,
} from './auth';

export {
  createServiceAccountClient,
  createServiceAccountClientFromKey,
} from './service-account';

export {
  buildRawMessage,
  createGmailClient,
  decodeMessageData,
  encodeMessage,
  getMessage,
  getPlainTextBody,
  searchMessages,
  sendGmailMessage,
  trashMessage,
  waitForMessage,
} from './gmail';

export type {
  AuthUrlOptions,
  GmailClient,
  GmailGetMessageOptions,
  GmailMessageAddress,
  GmailMessage,
  GmailMessagePart,
  GmailRecipient,
  GmailSearchOptions,
  GmailSearchResult,
  GmailSendOptions,
  GmailSendResult,
  OAuthClientConfig,
  OAuthCredentials,
  ServiceAccountConfig,
  ServiceAccountKeyFile,
  GmailWaitForMessageOptions,
} from './types';

export type { GmailAuthClient } from './gmail';
