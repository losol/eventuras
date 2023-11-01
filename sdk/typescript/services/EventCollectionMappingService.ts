/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EventCollectionMappingService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Success
     * @throws ApiError
     */
    public putV3EventsCollections({
        eventId,
        collectionId,
        eventurasOrgId,
    }: {
        eventId: number,
        collectionId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/events/{eventId}/collections/{collectionId}',
            path: {
                'eventId': eventId,
                'collectionId': collectionId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteV3EventsCollections({
        eventId,
        collectionId,
        eventurasOrgId,
    }: {
        eventId: number,
        collectionId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v3/events/{eventId}/collections/{collectionId}',
            path: {
                'eventId': eventId,
                'collectionId': collectionId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

}
