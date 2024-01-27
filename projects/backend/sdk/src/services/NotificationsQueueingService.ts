/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailNotificationDto } from '../models/EmailNotificationDto';
import type { NotificationDto } from '../models/NotificationDto';
import type { SmsNotificationDto } from '../models/SmsNotificationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class NotificationsQueueingService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public postV3NotificationsEmail({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: EmailNotificationDto,
    }): CancelablePromise<NotificationDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/notifications/email',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns NotificationDto Success
     * @throws ApiError
     */
    public postV3NotificationsSms({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: SmsNotificationDto,
    }): CancelablePromise<NotificationDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/notifications/sms',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
