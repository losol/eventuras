import { NextRequest, NextResponse } from 'next/server';

// Internationalization(i18n) Routing
// https://nextjs.org/docs/pages/building-your-application/routing/internationalization#sub-path-routing
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  // Prevent inernationalization for _next routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    // req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  };

  if (req.nextUrl.locale === 'nb-NO') {
    const locale = req.cookies.get('NEXT_LOCALE')?.value || '';

    // Testing. TODO: Delete
    const newUrl = new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url);
    console.log(locale);
    console.log(newUrl);


    return NextResponse.redirect(
      new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
    );
  };
};
