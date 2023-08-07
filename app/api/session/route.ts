import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    authenticated: !!session,
    session,
  });
}
