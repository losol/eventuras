/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationDto } from '../models/OrganizationDto';
import type { OrganizationFormDto } from '../models/OrganizationFormDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationsService {

    /**
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public static getV3Organizations(): CancelablePromise<Array<OrganizationDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/organizations',
        });
    }

    /**
     * @param requestBody
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public static postV3Organizations(
        requestBody?: OrganizationFormDto,
    ): CancelablePromise<OrganizationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/organizations',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @param organizationId
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public static getV3Organizations1(
        organizationId: number,
    ): CancelablePromise<OrganizationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }

    /**
     * @param organizationId
     * @param requestBody
     * @returns OrganizationDto Success
     * @throws ApiError
     */
    public static putV3Organizations(
        organizationId: number,
        requestBody?: OrganizationFormDto,
    ): CancelablePromise<OrganizationDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @param organizationId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3Organizations(
        organizationId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }

}
