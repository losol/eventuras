/**
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * This file is to provide middleware which, through a matcher, will protect specific urls from unauthorized access.
 * This saves individual pages to have to check for authorization.
 */

import { withAuth } from 'next-auth/middleware';
export default withAuth;
/*
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  console.log("AAA")
  console.log({middleareToken:token})
  return NextResponse.next()

}*/
export const config = { matcher: ['/admin/:path*', '/user/:path*'] };
