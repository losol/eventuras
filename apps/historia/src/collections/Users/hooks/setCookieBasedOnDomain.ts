import type { CollectionAfterLoginHook } from 'payload';
import { generateCookie, getCookieExpiration, mergeHeaders } from 'payload';

export const setCookieBasedOnDomain: CollectionAfterLoginHook = async ({ req, user }) => {
  const host = req.headers.get('host');

  if (!host) {
    return user;
  }

  const relatedOrg = await req.payload.find({
    collection: 'websites',
    depth: 0,
    limit: 1,
    where: {
      domains: {
        contains: host,
      },
    },
  });

  // If a matching tenant is found, set the 'historia-tenant' cookie
  if (relatedOrg && relatedOrg.docs.length > 0) {
    const tenantCookie = generateCookie({
      name: 'historia-tenant',
      expires: getCookieExpiration({ seconds: 7200 }),
      path: '/',
      returnCookieAsObject: false,
      value: String(relatedOrg.docs[0].id),
    });

    // Merge existing responseHeaders with the new Set-Cookie header
    const newHeaders = new Headers({
      'Set-Cookie': tenantCookie as string,
    });

    // Ensure you merge existing response headers if they already exist
    req.responseHeaders = req.responseHeaders
      ? mergeHeaders(req.responseHeaders, newHeaders)
      : newHeaders;
  }

  return user;
};
