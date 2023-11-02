import { Eventuras, UserDto, UserDtoPageResponseDto } from '@losol/eventuras';

import ApiError from '../ApiError';
import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

const eventuras = new Eventuras();
export type GetUsersOptions = Parameters<typeof eventuras.users.getV3Users1>[0];

export const getUserProfile = (): Promise<ApiResult<UserDto, ApiError>> =>
  apiFetch(ApiURLs.userprofile());
export const getUsers = (
  options: GetUsersOptions = {}
): Promise<ApiResult<UserDtoPageResponseDto, ApiError>> => apiFetch(ApiURLs.users(options));
