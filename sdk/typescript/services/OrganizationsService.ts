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
    public static getV3Organizations({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OrganizationDto>> {
        return __request(OpenAPI, {
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
    public static postV3Organizations({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: OrganizationFormDto,
    }): CancelablePromise<OrganizationDto> {
        return __request(OpenAPI, {
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
    public static getV3Organizations1({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<OrganizationDto> {
        return __request(OpenAPI, {
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
    public static putV3Organizations({
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
        return __request(OpenAPI, {
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
    public static deleteV3Organizations({
        organizationId,
        eventurasOrgId,
    }: {
        organizationId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
