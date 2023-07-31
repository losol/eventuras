/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventCollectionDto } from '../models/EventCollectionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventCollectionService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3EventsCollections(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events/collections',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postV3EventsCollections({
        requestBody,
    }: {
        requestBody?: EventCollectionDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/events/collections',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3EventsCollections1({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events/collections/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putV3EventsCollections({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: EventCollectionDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/events/collections/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3EventsCollections({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/events/collections/{id}',
            path: {
                'id': id,
            },
        });
    }

}
