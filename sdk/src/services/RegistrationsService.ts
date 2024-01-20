/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewRegistrationDto } from '../models/NewRegistrationDto';
import type { RegistrationDto } from '../models/RegistrationDto';
import type { RegistrationDtoPageResponseDto } from '../models/RegistrationDtoPageResponseDto';
import type { RegistrationUpdateDto } from '../models/RegistrationUpdateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RegistrationsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns RegistrationDtoPageResponseDto Success
     * @throws ApiError
     */
    public getV3Registrations({
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
        ordering,
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
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<RegistrationDtoPageResponseDto> {
        return this.httpRequest.request({
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
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public postV3Registrations({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewRegistrationDto,
    }): CancelablePromise<RegistrationDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/registrations',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public getV3Registrations1({
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
        ordering,
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
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<RegistrationDto> {
        return this.httpRequest.request({
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
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns RegistrationDto Success
     * @throws ApiError
     */
    public putV3Registrations({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: RegistrationUpdateDto,
    }): CancelablePromise<RegistrationDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
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
    public patchV3Registrations({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: any,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/v3/registrations/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteV3Registrations({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
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
    public postV3RegistrationsMe({
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
        return this.httpRequest.request({
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
