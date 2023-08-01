/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

export { default } from 'next-auth/middleware';

export const config = { matcher: ['/events/:id/register'] };
