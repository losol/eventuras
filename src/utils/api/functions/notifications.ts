import { EmailNotificationDto, NotificationDto } from '@losol/eventuras';

import Environment from '@/utils/Environment';

import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

export const sendEmailNotification = (
  options: EmailNotificationDto
): Promise<ApiResult<NotificationDto>> =>
  apiFetch(
    ApiURLs.sendEmailNotification({ orgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID) }),
    {
      method: 'POST',
      body: JSON.stringify(options),
    }
  );
