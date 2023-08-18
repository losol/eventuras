import { UserDto } from '@losol/eventuras/models/UserDto';

import ApiError from '../ApiError';
import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

const getUserProfile = (): Promise<ApiResult<UserDto, ApiError>> => apiFetch(ApiURLs.userprofile);

export { getUserProfile };
