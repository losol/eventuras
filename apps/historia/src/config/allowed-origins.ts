export const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS
  ? process.env.CMS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];

export function getAllowedDomainsFromAllowedOrigins(origins: string[]): string[] | undefined {
  const domains = origins
    .map(origin => {
      try {
        // Typical case: origin is like "https://example.com"
        return new URL(origin).host;
      } catch {
        // Fallback: allow hostnames/hosts directly
        return origin;
      }
    })
    .map(s => s.trim())
    .filter(Boolean);

  return domains.length ? domains : undefined;
}
