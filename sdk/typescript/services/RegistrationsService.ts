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
        includeEventInfo,
        includeUserInfo,
        includeProducts,
        includeOrders,
        page,
        count,
        limit,
        offset,
    }: {
        eventId?: number,
        includeEventInfo?: boolean,
        includeUserInfo?: boolean,
        includeProducts?: boolean,
        includeOrders?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    }): CancelablePromise<RegistrationDtoPageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations',
            query: {
                'EventId': eventId,
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
        requestBody,
    }: {
        requestBody?: NewRegistrationDto,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations',
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
        includeEventInfo,
        includeUserInfo,
        includeProducts,
        includeOrders,
        page,
        count,
        limit,
        offset,
    }: {
        id: number,
        eventId?: number,
        includeEventInfo?: boolean,
        includeUserInfo?: boolean,
        includeProducts?: boolean,
        includeOrders?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
            },
            query: {
                'EventId': eventId,
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
        requestBody,
    }: {
        id: number,
        requestBody?: RegistrationFormDto,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
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
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
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
    }: {
        eventId: number,
        createOrder?: boolean,
    }): CancelablePromise<RegistrationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations/me/{eventId}',
            path: {
                'eventId': eventId,
            },
            query: {
                'createOrder': createOrder,
            },
        });
    }

}
