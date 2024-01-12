/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationRecipientListOrder } from '../models/NotificationRecipientListOrder';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class NotificationRecipientsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any Success
     * @throws ApiError
     */
    public getV3NotificationsRecipients({
        id,
        query,
        sentOnly,
        errorsOnly,
        order,
        desc,
        page,
        count,
        limit,
        offset,
        ordering,
        eventurasOrgId,
    }: {
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
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/notifications/{id}/recipients',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
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
                'Ordering': ordering,
            },
        });
    }
}
