/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

import { withAuth } from 'next-auth/middleware';
export default withAuth;

export const config = { matcher: ['/admin', '/events/:id/register'] };
