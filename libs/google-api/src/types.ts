import type { Credentials, GenerateAuthUrlOpts, JWTOptions } from 'google-auth-library';
import type { gmail_v1 } from 'googleapis';

/**
 * Configuration for creating an OAuth2 client via Google APIs.
 */
export interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Configuration for creating a service account client.
 */
export interface ServiceAccountConfig {
  clientEmail: string;
  privateKey: string;
  scopes: string[];
  subject?: string;
  options?: Omit<JWTOptions, 'email' | 'key' | 'scopes' | 'subject'>;
}

/**
 * Google service account key JSON subset.
 */
export interface ServiceAccountKeyFile {
  client_email: string;
  private_key: string;
}

/**
 * Helper interface for friendly email formatting.
 */
export interface GmailMessageAddress {
  name?: string;
  email: string;
}

export type GmailRecipient = GmailMessageAddress | string | Array<GmailMessageAddress | string>;

export interface GmailSendOptions {
  from: GmailRecipient;
  to: GmailRecipient;
  cc?: GmailRecipient;
  bcc?: GmailRecipient;
  replyTo?: GmailRecipient;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  threadId?: string;
}

export interface GmailSendResult {
  id: string;
  threadId?: string | null;
  labelIds?: string[] | null;
  rawSize?: number;
}

export type AuthUrlOptions = GenerateAuthUrlOpts;
export type OAuthCredentials = Credentials;
export type GmailClient = gmail_v1.Gmail;
export type GmailMessage = gmail_v1.Schema$Message;
export type GmailMessagePart = gmail_v1.Schema$MessagePart;

export interface GmailSearchOptions {
  query: string;
  userId?: string;
  maxResults?: number;
  pageToken?: string;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export interface GmailSearchResult {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailGetMessageOptions {
  id: string;
  userId?: string;
  format?: 'minimal' | 'full' | 'metadata' | 'raw';
  metadataHeaders?: string[];
}

export interface GmailWaitForMessageOptions extends GmailSearchOptions {
  maxAttempts?: number;
  intervalMs?: number;
}
