/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationSettingDto } from '../models/OrganizationSettingDto';
import type { OrganizationSettingValueDto } from '../models/OrganizationSettingValueDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrganizationSettingsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns OrganizationSettingDto Success
     * @throws ApiError
     */
    public getV3OrganizationsSettings({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OrganizationSettingDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
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
    public putV3OrganizationsSettings({
        organizationId,
        eventurasOrgId,
        requestBody,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: OrganizationSettingValueDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public postV3OrganizationsSettings({
        organizationId,
        requestBody,
        eventurasOrgId,
    }: {
        organizationId: number,
        requestBody: Array<OrganizationSettingValueDto>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
