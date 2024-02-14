/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EventCertificatesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any Success
     * @throws ApiError
     */
    public getV3EventCertificates({
        id,
        page,
        count,
        limit,
        offset,
        ordering,
        eventurasOrgId,
    }: {
        id: number,
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
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public getV3EventCertificatesPreview({
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
    public postV3EventCertificatesIssue({
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
        return this.httpRequest.request({
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
    public postV3EventCertificatesUpdate({
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
