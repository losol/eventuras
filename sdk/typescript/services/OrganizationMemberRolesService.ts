/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleRequestDto } from '../models/RoleRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationMemberRolesService {

    /**
     * @returns string Success
     * @throws ApiError
     */
    public static getV3OrganizationsMembersRoles({
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
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
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
     * @returns string Success
     * @throws ApiError
     */
    public static postV3OrganizationsMembersRoles({
        organizationId,
        userId,
        eventurasOrgId,
        requestBody,
    }: {
        organizationId: number,
        userId: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: RoleRequestDto,
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns string Success
     * @throws ApiError
     */
    public static deleteV3OrganizationsMembersRoles({
        organizationId,
        userId,
        eventurasOrgId,
        requestBody,
    }: {
        organizationId: number,
        userId: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: RoleRequestDto,
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
