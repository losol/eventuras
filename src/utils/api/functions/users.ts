import { UsersService } from '@losol/eventuras';
import { UserDto } from '@losol/eventuras/models/UserDto';
import { UserDtoPageResponseDto } from '@losol/eventuras/models/UserDtoPageResponseDto';

import ApiError from '../ApiError';
import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

export type GetUsersOptions = Parameters<typeof UsersService.getV3Users1>[0];

export const getUserProfile = (): Promise<ApiResult<UserDto, ApiError>> =>
  apiFetch(ApiURLs.userprofile());
export const getUsers = (
  options: GetUsersOptions = {}
): Promise<ApiResult<UserDtoPageResponseDto, ApiError>> => apiFetch(ApiURLs.users(options));
