import { headers } from 'next/headers';
import {TokenBucket} from '@eventuras/fides-auth/rate-limit';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'fides-auth-next:request' });

// Initialize bucket lazily to avoid worker thread issues
let globalBucket: TokenBucket<string> | null = null;

function getBucket(): TokenBucket<string> {
  if (!globalBucket) {
    globalBucket = new TokenBucket<string>(100, 1);
  }
  return globalBucket;
}

export async function globalGETRateLimit(): Promise<boolean> {
  try {
    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP === null) {
      return true;
    }
    return getBucket().consume(clientIP, 1);
  } catch (error) {
    // If worker thread crashes, allow the request through
    if (error instanceof Error && error.message.includes('worker')) {
      logger.error({ error }, 'Worker thread error in globalGETRateLimit');
    } else {
      logger.error({ error }, 'Unexpected error in globalGETRateLimit');
    }
    return true;
  }
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  try {
    const headerStore = await headers();
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP === null) {
      return true;
    }
    return getBucket().consume(clientIP, 3);
  } catch (error) {
    // If worker thread crashes, allow the request through
    if (error instanceof Error && error.message.includes('worker')) {
      logger.error({ error }, 'Worker thread error in globalPOSTRateLimit');
    } else {
      logger.error({ error }, 'Unexpected error in globalPOSTRateLimit');
    }
    return true;
  }
}
