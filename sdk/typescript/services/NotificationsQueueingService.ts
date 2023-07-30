/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailNotificationDto } from '../models/EmailNotificationDto';
import type { NotificationDto } from '../models/NotificationDto';
import type { SmsNotificationDto } from '../models/SmsNotificationDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotificationsQueueingService {

    /**
     * @param requestBody
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public static postV3NotificationsEmail(
        requestBody?: EmailNotificationDto,
    ): CancelablePromise<NotificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/notifications/email',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @param requestBody
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public static postV3NotificationsSms(
        requestBody?: SmsNotificationDto,
    ): CancelablePromise<NotificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/notifications/sms',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
