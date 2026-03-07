import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const PRIVATE_IP_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^169\.254\./, // link-local
  /^0\./, // 0.0.0.0/8
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
  /^fd[0-9a-f]{2}:/i, // IPv6 unique local (fd00::/8)
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

/**
 * Validates a URL to prevent SSRF attacks.
 * Returns an error message string if invalid, or null if the URL is safe.
 */
export async function validateUrl(url: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'Invalid URL format';
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return 'Only http and https protocols are allowed';
  }

  // Strip IPv6 brackets: URL.hostname returns "[::1]" for IPv6 addresses
  const hostname = parsed.hostname.replaceAll(/^\[|\]$/g, '');

  // If hostname is an IP literal, check it directly without DNS
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return 'URLs pointing to private/internal networks are not allowed';
    }
    return null;
  }

  // Resolve hostname (both A and AAAA records) and check resolved IPs
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const { address } of addresses) {
      if (isPrivateIp(address)) {
        return 'URL resolves to a private/internal IP address';
      }
    }
  } catch {
    return 'Could not resolve hostname';
  }

  return null;
}
