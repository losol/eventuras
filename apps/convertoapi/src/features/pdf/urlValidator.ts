import { resolve as dnsResolve } from 'dns/promises';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

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
  /^fd/i, // IPv6 unique local
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

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return 'Only http and https protocols are allowed';
  }

  // Strip IPv6 brackets: URL.hostname returns "[::1]" for IPv6 addresses
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');

  if (isPrivateIp(hostname)) {
    return 'URLs pointing to private/internal networks are not allowed';
  }

  // Resolve hostname and check that resolved IPs are not private
  try {
    const addresses = await dnsResolve(hostname);
    for (const addr of addresses) {
      if (isPrivateIp(addr)) {
        return 'URL resolves to a private/internal IP address';
      }
    }
  } catch {
    return 'Could not resolve hostname';
  }

  return null;
}
