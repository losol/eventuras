/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventCollectionMappingService {

    /**
     * @param eventId
     * @param collectionId
     * @returns any Success
     * @throws ApiError
     */
    public static putV3EventsCollections(
        eventId: number,
        collectionId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/events/{eventId}/collections/{collectionId}',
            path: {
                'eventId': eventId,
                'collectionId': collectionId,
            },
        });
    }

    /**
     * @param eventId
     * @param collectionId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3EventsCollections(
        eventId: number,
        collectionId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/events/{eventId}/collections/{collectionId}',
            path: {
                'eventId': eventId,
                'collectionId': collectionId,
            },
        });
    }

}
