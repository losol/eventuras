type Options = {
  allowedDomains?: string[];
};

import { allowedOrigins, getAllowedDomainsFromAllowedOrigins } from '@/config/allowed-origins';

function firstForwardedValue(value: string | null): string | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)[0];
}

function normalizeAllowedDomains(domains: string[]): Set<string> {
  return new Set(domains.map(d => d.trim().toLowerCase()).filter(Boolean));
}

function isAllowedHost(host: string, allowed: Set<string>): boolean {
  const h = host.toLowerCase();
  if (allowed.has(h)) return true;
  const hostname = h.split(':')[0];
  return !!hostname && allowed.has(hostname);
}

/**
 * Compute a public origin for the current request, optionally validating host
 * against an allowlist.
 */
export function getPublicRequestOrigin(request: Request, options: Options = {}): string {
  const url = new URL(request.url);

  const forwardedHost = firstForwardedValue(request.headers.get('x-forwarded-host'));
  const host = request.headers.get('host') || url.host;

  const allowed = options.allowedDomains?.length ? normalizeAllowedDomains(options.allowedDomains) : undefined;

  // Only trust forwarded host when we have an allowlist.
  const candidateHost = allowed ? forwardedHost || host : host;
  const selectedHost = allowed && !isAllowedHost(candidateHost, allowed) ? host : candidateHost;

  const forwardedProto = firstForwardedValue(request.headers.get('x-forwarded-proto'));
  const proto = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : undefined;

  const protocol = proto || (selectedHost.includes('localhost') ? 'http' : 'https');

  return `${protocol}://${selectedHost}`;
}

export function getAllowedVippsLoginDomains(): string[] | undefined {
  return getAllowedDomainsFromAllowedOrigins(allowedOrigins);
}
