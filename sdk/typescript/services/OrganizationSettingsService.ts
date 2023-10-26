/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationSettingDto } from '../models/OrganizationSettingDto';
import type { OrganizationSettingValueDto } from '../models/OrganizationSettingValueDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationSettingsService {

    /**
     * @returns OrganizationSettingDto Success
     * @throws ApiError
     */
    public static getV3OrganizationsSettings({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OrganizationSettingDto>> {
        return __request(OpenAPI, {
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
    public static putV3OrganizationsSettings({
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
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/organizations/{organizationId}/settings',
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
    public static postV3OrganizationsSettings({
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
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/organizations/{organizationId}/settings',
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

}
