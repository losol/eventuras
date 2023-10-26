/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewRegistrationDto } from '../models/NewRegistrationDto';
import type { RegistrationDto } from '../models/RegistrationDto';
import type { RegistrationDtoPageResponseDto } from '../models/RegistrationDtoPageResponseDto';
import type { RegistrationFormDto } from '../models/RegistrationFormDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RegistrationsService {

    /**
     * @returns RegistrationDtoPageResponseDto Success
     * @throws ApiError
     */
    public static getV3Registrations({
        eventId,
        userId,
        includeEventInfo,
        includeUserInfo,
        includeProducts,
        includeOrders,
        page,
        count,
        limit,
        offset,
        eventurasOrgId,
    }: {
        eventId?: number,
        userId?: string,
        includeEventInfo?: boolean,
        includeUserInfo?: boolean,
        includeProducts?: boolean,
        includeOrders?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<RegistrationDtoPageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'EventId': eventId,
                'UserId': userId,
                'IncludeEventInfo': includeEventInfo,
                'IncludeUserInfo': includeUserInfo,
                'IncludeProducts': includeProducts,
                'IncludeOrders': includeOrders,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public static postV3Registrations({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewRegistrationDto,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public static getV3Registrations1({
        id,
        eventId,
        userId,
        includeEventInfo,
        includeUserInfo,
        includeProducts,
        includeOrders,
        page,
        count,
        limit,
        offset,
        eventurasOrgId,
    }: {
        id: number,
        eventId?: number,
        userId?: string,
        includeEventInfo?: boolean,
        includeUserInfo?: boolean,
        includeProducts?: boolean,
        includeOrders?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'EventId': eventId,
                'UserId': userId,
                'IncludeEventInfo': includeEventInfo,
                'IncludeUserInfo': includeUserInfo,
                'IncludeProducts': includeProducts,
                'IncludeOrders': includeOrders,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public static putV3Registrations({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: RegistrationFormDto,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
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
    public static deleteV3Registrations({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

    /**
     * Alias for POST /v3/registrations
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public static postV3RegistrationsMe({
        eventId,
        createOrder,
        eventurasOrgId,
    }: {
        eventId: number,
        createOrder?: boolean,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations/me/{eventId}',
            path: {
                'eventId': eventId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'createOrder': createOrder,
            },
        });
    }

}
