import { RegistrationDtoPageResponseDto } from '@losol/eventuras/models/RegistrationDtoPageResponseDto';

import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

export const getUserRegistrations = (
  userId: string
): Promise<ApiResult<RegistrationDtoPageResponseDto>> =>
  apiFetch(ApiURLs.userRegistrations(userId));
