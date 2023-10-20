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
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public static postV3NotificationsEmail({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: EmailNotificationDto,
    }): CancelablePromise<NotificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/notifications/email',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public static postV3NotificationsSms({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: SmsNotificationDto,
    }): CancelablePromise<NotificationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/notifications/sms',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
