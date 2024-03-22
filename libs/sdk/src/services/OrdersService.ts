/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewOrderRequestDto } from '../models/NewOrderRequestDto';
import type { OrderDto } from '../models/OrderDto';
import type { OrderStatus } from '../models/OrderStatus';
import type { OrderUpdateRequestDto } from '../models/OrderUpdateRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OrdersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns OrderDto Success
     * @throws ApiError
     */
    public getV3Orders({
        id,
        includeUser,
        includeRegistration,
        eventurasOrgId,
    }: {
        id: number,
        includeUser?: boolean,
        includeRegistration?: boolean,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<OrderDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/orders/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'IncludeUser': includeUser,
                'IncludeRegistration': includeRegistration,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public patchV3Orders({
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
            url: '/v3/orders/{id}',
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
    public putV3Orders({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: OrderUpdateRequestDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/orders/{id}',
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
    public deleteV3Orders({
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
            url: '/v3/orders/{id}',
            path: {
                'id': id,
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
    public getV3Orders1({
        userId,
        eventId,
        registrationId,
        status,
        includeUser,
        includeRegistration,
        organizationId,
        page,
        count,
        limit,
        offset,
        ordering,
        eventurasOrgId,
    }: {
        userId?: string,
        eventId?: number,
        registrationId?: number,
        status?: OrderStatus,
        includeUser?: boolean,
        includeRegistration?: boolean,
        organizationId?: number,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/orders',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'UserId': userId,
                'EventId': eventId,
                'RegistrationId': registrationId,
                'Status': status,
                'IncludeUser': includeUser,
                'IncludeRegistration': includeRegistration,
                'OrganizationId': organizationId,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public postV3Orders({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewOrderRequestDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/orders',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
