import { google, type gmail_v1 } from 'googleapis';
import type { JWT, OAuth2Client } from 'google-auth-library';
import type {
  GmailGetMessageOptions,
  GmailMessage,
  GmailMessageAddress,
  GmailMessagePart,
  GmailRecipient,
  GmailSearchOptions,
  GmailSearchResult,
  GmailSendOptions,
  GmailSendResult,
  GmailWaitForMessageOptions,
} from './types';

export type GmailAuthClient = OAuth2Client | JWT;

const DEFAULT_USER_ID = 'me';

function isAscii(value: string): boolean {
  for (let index = 0; index < value.length;) {
    const codePoint = value.codePointAt(index);
    if (codePoint === undefined) {
      return false;
    }

    const isAllowedControl = codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d;
    if ((codePoint < 0x20 && !isAllowedControl) || codePoint > 0x7e) {
      return false;
    }

    index += codePoint > 0xffff ? 2 : 1;
  }

  return true;
}

export function createGmailClient(auth: GmailAuthClient): gmail_v1.Gmail {
  return google.gmail({ version: 'v1', auth });
}

function resolveUserId(userId?: string): string {
  return userId && userId.length > 0 ? userId : DEFAULT_USER_ID;
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

function encodeHeaderValue(value: string): string {
  if (value.length === 0) {
    return value;
  }

  if (isAscii(value)) {
    return value;
  }

  const base64 = Buffer.from(value, 'utf8').toString('base64');
  return `=?UTF-8?B?${base64}?=`;
}

function formatSingleRecipient(entry: GmailMessageAddress | string): string {
  if (typeof entry === 'string') {
    return entry;
  }

  const trimmedEmail = entry.email.trim();
  const displayName = entry.name?.trim();

  if (!displayName) {
    return trimmedEmail;
  }

  return `${encodeHeaderValue(displayName)} <${trimmedEmail}>`;
}

function formatRecipient(recipient?: GmailRecipient): string | undefined {
  if (!recipient) {
    return undefined;
  }

  const entries = Array.isArray(recipient) ? recipient : [recipient];
  const formatted = entries
    .map((entry) => formatSingleRecipient(entry))
    .filter((value) => value && value.length > 0);

  if (formatted.length === 0) {
    return undefined;
  }

  return formatted.join(', ');
}

function assertRecipient(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Gmail message requires ${field} header.`);
  }

  return value;
}

function appendMultipartBody(
  lines: string[],
  boundary: string,
  textBody?: string,
  htmlBody?: string,
) {
  if (textBody) {
    lines.push(
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      textBody,
    );
  }

  if (htmlBody) {
    lines.push(
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      htmlBody,
    );
  }

  lines.push(`--${boundary}--`, '');
}

function buildMimeMessage(options: GmailSendOptions): string {
  const fromHeader = assertRecipient(formatRecipient(options.from), 'From');
  const toHeader = assertRecipient(formatRecipient(options.to), 'To');
  const ccHeader = formatRecipient(options.cc);
  const bccHeader = formatRecipient(options.bcc);
  const replyToHeader = formatRecipient(options.replyTo);
  const hasText = typeof options.textBody === 'string' && options.textBody.length > 0;
  const hasHtml = typeof options.htmlBody === 'string' && options.htmlBody.length > 0;

  if (!hasText && !hasHtml) {
    throw new Error('Gmail message requires either a textBody or htmlBody.');
  }

  const lines: string[] = [];
  lines.push(`From: ${fromHeader}`, `To: ${toHeader}`);

  if (ccHeader) {
    lines.push(`Cc: ${ccHeader}`);
  }

  if (bccHeader) {
    lines.push(`Bcc: ${bccHeader}`);
  }

  if (replyToHeader) {
    lines.push(`Reply-To: ${replyToHeader}`);
  }

  lines.push(`Subject: ${encodeHeaderValue(options.subject)}`, 'MIME-Version: 1.0');

  if (hasText && hasHtml) {
    const boundary = `=_eventuras_${Date.now().toString(16)}`;
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, '');
    appendMultipartBody(lines, boundary, options.textBody, options.htmlBody);
  } else if (hasHtml) {
    lines.push(
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.htmlBody ?? '',
    );
  } else {
    lines.push(
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.textBody ?? '',
    );
  }

  return lines.join('\r\n');
}

export function encodeMessage(message: string): string {
  return Buffer.from(message, 'utf8')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

export function buildRawMessage(options: GmailSendOptions): string {
  const mimeMessage = buildMimeMessage(options);
  return encodeMessage(mimeMessage);
}

function normalizeBase64Url(input: string): string {
  const replaced = input.replaceAll('-', '+').replaceAll('_', '/');
  const remainder = replaced.length % 4;
  if (remainder === 0) {
    return replaced;
  }

  return replaced.padEnd(replaced.length + (4 - remainder), '=');
}

export function decodeMessageData(data: string): string {
  const normalized = normalizeBase64Url(data);
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function resolveBodyData(part?: GmailMessagePart | null): string | undefined {
  const data = part?.body?.data;
  if (!data) {
    return undefined;
  }

  return decodeMessageData(data);
}

function findPayloadPart(
  part: GmailMessagePart | undefined,
  predicate: (candidate: GmailMessagePart) => boolean,
): GmailMessagePart | undefined {
  if (!part) {
    return undefined;
  }

  if (predicate(part)) {
    return part;
  }

  const children = part.parts ?? [];
  for (const child of children) {
    const match = findPayloadPart(child, predicate);
    if (match) {
      return match;
    }
  }

  return undefined;
}

export function getPlainTextBody(message: GmailMessage): string | undefined {
  const payload = message.payload;
  if (!payload) {
    return undefined;
  }

  if (payload.body?.data && payload.mimeType === 'text/plain') {
    return decodeMessageData(payload.body.data);
  }

  const part = findPayloadPart(payload, (candidate) => candidate.mimeType === 'text/plain');
  return resolveBodyData(part);
}

export async function sendGmailMessage(
  gmailClient: gmail_v1.Gmail,
  options: GmailSendOptions,
  userId: string = DEFAULT_USER_ID,
): Promise<GmailSendResult> {
  const raw = buildRawMessage(options);
  const response = await gmailClient.users.messages.send({
    userId,
    requestBody: {
      raw,
      threadId: options.threadId,
    },
  });

  const data = response.data;
  if (!data.id) {
    throw new Error('Gmail API did not return a message id.');
  }

  return {
    id: data.id,
    threadId: data.threadId ?? undefined,
    labelIds: data.labelIds ?? undefined,
    rawSize: typeof data.sizeEstimate === 'number' ? data.sizeEstimate : undefined,
  };
}

export async function searchMessages(
  gmailClient: gmail_v1.Gmail,
  options: GmailSearchOptions,
): Promise<GmailSearchResult> {
  const response = await gmailClient.users.messages.list({
    userId: resolveUserId(options.userId),
    q: options.query,
    maxResults: options.maxResults,
    pageToken: options.pageToken,
    labelIds: options.labelIds,
    includeSpamTrash: options.includeSpamTrash,
  });

  return {
    messages: response.data.messages ?? [],
    nextPageToken: response.data.nextPageToken ?? undefined,
    resultSizeEstimate: response.data.resultSizeEstimate ?? undefined,
  };
}

export async function getMessage(
  gmailClient: gmail_v1.Gmail,
  options: GmailGetMessageOptions,
): Promise<GmailMessage | undefined> {
  if (!options.id) {
    throw new Error('Gmail message id is required.');
  }

  const response = await gmailClient.users.messages.get({
    userId: resolveUserId(options.userId),
    id: options.id,
    format: options.format,
    metadataHeaders: options.metadataHeaders,
  });

  return response.data ?? undefined;
}

export async function trashMessage(
  gmailClient: gmail_v1.Gmail,
  id: string,
  userId?: string,
): Promise<void> {
  if (!id) {
    throw new Error('Gmail message id is required.');
  }

  await gmailClient.users.messages.trash({
    userId: resolveUserId(userId),
    id,
  });
}

export async function waitForMessage(
  gmailClient: gmail_v1.Gmail,
  options: GmailWaitForMessageOptions,
): Promise<GmailMessage | undefined> {
  const maxAttempts = options.maxAttempts ?? 10;
  const intervalMs = options.intervalMs ?? 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { messages } = await searchMessages(gmailClient, options);
    const message = messages[0];
    if (message) {
      return message;
    }

    if (attempt < maxAttempts) {
      await delay(intervalMs);
    }
  }

  return undefined;
}
