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
    }: {
        organizationId: number,
    }): CancelablePromise<Array<OrganizationSettingDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putV3OrganizationsSettings({
        organizationId,
        requestBody,
    }: {
        organizationId: number,
        requestBody?: OrganizationSettingValueDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
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
    }: {
        organizationId: number,
        requestBody: Array<OrganizationSettingValueDto>,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/organizations/{organizationId}/settings',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
