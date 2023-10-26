/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventCertificatesService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3EventCertificates({
        id,
        page,
        count,
        limit,
        offset,
        eventurasOrgId,
    }: {
        id: number,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/event/{id}/certificates',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3EventCertificatesPreview({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/event/{id}/certificates/preview',
            path: {
                'id': id,
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
    public static postV3EventCertificatesIssue({
        id,
        send = true,
        eventurasOrgId,
    }: {
        id: number,
        send?: boolean,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/event/{id}/certificates/issue',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'send': send,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postV3EventCertificatesUpdate({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/event/{id}/certificates/update',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

}
