/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationMembersService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putV3OrganizationsMembers({
        organizationId,
        userId,
        eventurasOrgId,
    }: {
        organizationId: number,
        userId: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/organizations/{organizationId}/members/{userId}',
            path: {
                'organizationId': organizationId,
                'userId': userId,
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
    public static deleteV3OrganizationsMembers({
        organizationId,
        userId,
        eventurasOrgId,
    }: {
        organizationId: number,
        userId: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}/members/{userId}',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

}
