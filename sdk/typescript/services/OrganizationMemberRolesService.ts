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
    }: {
        organizationId: number,
        userId: string,
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
            path: {
                'organizationId': organizationId,
                'userId': userId,
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
        requestBody,
    }: {
        organizationId: number,
        userId: string,
        requestBody?: RoleRequestDto,
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
            path: {
                'organizationId': organizationId,
                'userId': userId,
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
        requestBody,
    }: {
        organizationId: number,
        userId: string,
        requestBody?: RoleRequestDto,
    }): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}/members/{userId}/roles',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
