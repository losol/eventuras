/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationRecipientListOrder } from '../models/NotificationRecipientListOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotificationRecipientsService {

    /**
     * @param id
     * @param query
     * @param sentOnly
     * @param errorsOnly
     * @param order
     * @param desc
     * @param page
     * @param count
     * @param limit
     * @param offset
     * @returns any Success
     * @throws ApiError
     */
    public static getV3NotificationsRecipients(
        id: number,
        query?: string,
        sentOnly?: boolean,
        errorsOnly?: boolean,
        order?: NotificationRecipientListOrder,
        desc?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/notifications/{id}/recipients',
            path: {
                'id': id,
            },
            query: {
                'Query': query,
                'SentOnly': sentOnly,
                'ErrorsOnly': errorsOnly,
                'Order': order,
                'Desc': desc,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

}
