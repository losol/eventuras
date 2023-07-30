/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationListOrder } from '../models/NotificationListOrder';
import type { NotificationStatus } from '../models/NotificationStatus';
import type { NotificationType } from '../models/NotificationType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotificationsService {

    /**
     * @param id
     * @param includeStatistics
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Notifications(
        id: number,
        includeStatistics: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/notifications/{id}',
            path: {
                'id': id,
            },
            query: {
                'includeStatistics': includeStatistics,
            },
        });
    }

    /**
     * @param eventId
     * @param productId
     * @param status
     * @param type
     * @param recipientUserId
     * @param order
     * @param desc
     * @param includeStatistics Whether to include delivery statistics into response.
     * @param page
     * @param count
     * @param limit
     * @param offset
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Notifications1(
        eventId?: number,
        productId?: number,
        status?: NotificationStatus,
        type?: NotificationType,
        recipientUserId?: string,
        order?: NotificationListOrder,
        desc?: boolean,
        includeStatistics?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/notifications',
            query: {
                'EventId': eventId,
                'ProductId': productId,
                'Status': status,
                'Type': type,
                'RecipientUserId': recipientUserId,
                'Order': order,
                'Desc': desc,
                'IncludeStatistics': includeStatistics,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

}
