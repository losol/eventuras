/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationMembersService {

    /**
     * @param organizationId
     * @param userId
     * @returns any Success
     * @throws ApiError
     */
    public static putV3OrganizationsMembers(
        organizationId: number,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/organizations/{organizationId}/members/{userId}',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
        });
    }

    /**
     * @param organizationId
     * @param userId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3OrganizationsMembers(
        organizationId: number,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}/members/{userId}',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
        });
    }

}
