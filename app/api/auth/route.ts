import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ path: '/api/auth/' });
}

export async function POST() {
  return new Response('400 Bad Request', {
    status: 400,
  });
}
