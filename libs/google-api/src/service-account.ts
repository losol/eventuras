import { JWT } from 'google-auth-library';
import type { ServiceAccountConfig, ServiceAccountKeyFile } from './types';

function normalizePrivateKey(privateKey: string): string {
  return privateKey.includes('-----BEGIN') ? privateKey.replaceAll(String.raw`\n`, '\n') : privateKey;
}

export function createServiceAccountClient(config: ServiceAccountConfig): JWT {
  return new JWT({
    email: config.clientEmail,
    key: normalizePrivateKey(config.privateKey),
    scopes: config.scopes,
    subject: config.subject,
    ...config.options,
  });
}

export function createServiceAccountClientFromKey(
  keyFile: ServiceAccountKeyFile,
  scopes: string[],
  subject?: string,
): JWT {
  return createServiceAccountClient({
    clientEmail: keyFile.client_email,
    privateKey: keyFile.private_key,
    scopes,
    subject,
  });
}
