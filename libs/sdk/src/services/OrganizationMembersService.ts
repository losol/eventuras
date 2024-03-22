/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrganizationMembersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any Success
     * @throws ApiError
     */
    public putV3OrganizationsMembers({
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
        return this.httpRequest.request({
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
    public deleteV3OrganizationsMembers({
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
        return this.httpRequest.request({
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
