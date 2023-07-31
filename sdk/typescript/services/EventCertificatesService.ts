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
    }: {
        id: number,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/event/{id}/certificates',
            path: {
                'id': id,
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
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/event/{id}/certificates/preview',
            path: {
                'id': id,
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
    }: {
        id: number,
        send?: boolean,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/event/{id}/certificates/issue',
            path: {
                'id': id,
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
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/event/{id}/certificates/update',
            path: {
                'id': id,
            },
        });
    }

}
