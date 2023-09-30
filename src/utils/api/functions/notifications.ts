import { EmailNotificationDto, NotificationDto } from '@losol/eventuras';

import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

export const sendEmailNotification = (
  options: EmailNotificationDto
): Promise<ApiResult<NotificationDto>> =>
  apiFetch(ApiURLs.sendEmailNotification(), { method: 'POST', body: JSON.stringify(options) });
