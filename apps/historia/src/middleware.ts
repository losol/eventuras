import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Log the request URL to check if middleware is invoked
  console.log('Middleware is running...');
  console.log('Request URL:', request.url);

  // Optionally, you can log the method or other details of the request
  console.log('Request Method:', request.method);

  // Proceed with the next step in the pipeline
  return NextResponse.next();
}

export const config = {
  // Match all routes
  matcher: '/:path*',
};
