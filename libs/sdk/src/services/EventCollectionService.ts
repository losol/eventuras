/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventCollectionCreateDto } from '../models/EventCollectionCreateDto';
import type { EventCollectionDto } from '../models/EventCollectionDto';
import type { EventCollectionDtoPageResponseDto } from '../models/EventCollectionDtoPageResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EventCollectionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns EventCollectionDtoPageResponseDto Success
     * @throws ApiError
     */
    public getV3Eventcollections({
        page,
        count,
        limit,
        offset,
        ordering,
        eventurasOrgId,
    }: {
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<EventCollectionDtoPageResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/eventcollections',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns EventCollectionDto Success
     * @throws ApiError
     */
    public postV3Eventcollections({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: EventCollectionCreateDto,
    }): CancelablePromise<EventCollectionDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/eventcollections',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns EventCollectionDto Success
     * @throws ApiError
     */
    public getV3Eventcollections1({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<EventCollectionDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/eventcollections/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns EventCollectionDto Success
     * @throws ApiError
     */
    public putV3Eventcollections({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: EventCollectionDto,
    }): CancelablePromise<EventCollectionDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/eventcollections/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteV3Eventcollections({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v3/eventcollections/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
