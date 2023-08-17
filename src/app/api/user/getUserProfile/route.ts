/**
 * API route that proxies a request to fetch a user's profile from the external eventuras API.
 *
 * @route GET /api/user/getUserProfile
 *
 * @returns {UserDto} The user's profile if successful.
 * @returns {Object} Error object if there's an error. The object will contain an `error` key with the error message.
 *
 * @throws {405} If the HTTP method is not GET.
 * @throws {500} If there's an error fetching the user profile from the external API.
 */

import { OpenAPI, UserDto, UsersService } from '@losol/eventuras';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  // Get the token.
  const token = await getToken({ req: req });
  if (token?.access_token == null) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }
  OpenAPI.BASE = process.env.API_BASE_URL as string;
  OpenAPI.VERSION = process.env.NEXT_PUBLIC_API_VERSION as string;
  OpenAPI.TOKEN = token.access_token as string;

  try {
    const userProfile: UserDto = await UsersService.getV3UsersMe();
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to fetch user profile: ${error.message}` },
      { status: 500 }
    );
  }
}
