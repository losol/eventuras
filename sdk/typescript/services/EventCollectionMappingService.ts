/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventCollectionMappingService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putV3EventsCollections({
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
        return __request(OpenAPI, {
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
    public static deleteV3EventsCollections({
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
        return __request(OpenAPI, {
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
