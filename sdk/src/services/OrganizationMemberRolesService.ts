/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleRequestDto } from '../models/RoleRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrganizationMemberRolesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns string Success
     * @throws ApiError
     */
    public getV3OrganizationsMembersRoles({
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
        return this.httpRequest.request({
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
    public postV3OrganizationsMembersRoles({
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
        return this.httpRequest.request({
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
    public deleteV3OrganizationsMembersRoles({
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
        return this.httpRequest.request({
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
