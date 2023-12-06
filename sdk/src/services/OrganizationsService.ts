/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationDto } from '../models/OrganizationDto';
import type { OrganizationFormDto } from '../models/OrganizationFormDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrganizationsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public getV3Organizations({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OrganizationDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/organizations',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public postV3Organizations({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: OrganizationFormDto,
    }): CancelablePromise<OrganizationDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/organizations',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }
    /**
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public getV3Organizations1({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<OrganizationDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public putV3Organizations({
        organizationId,
        eventurasOrgId,
        requestBody,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: OrganizationFormDto,
    }): CancelablePromise<OrganizationDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteV3Organizations({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
