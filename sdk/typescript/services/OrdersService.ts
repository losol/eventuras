/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewOrderRequestDto } from '../models/NewOrderRequestDto';
import type { OrderDto } from '../models/OrderDto';
import type { OrderStatus } from '../models/OrderStatus';
import type { OrderUpdateRequestDto } from '../models/OrderUpdateRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrdersService {

    /**
     * @param id
     * @param includeUser
     * @param includeRegistration
     * @returns OrderDto Success
     * @throws ApiError
     */
    public static getV3Orders(
        id: number,
        includeUser?: boolean,
        includeRegistration?: boolean,
    ): CancelablePromise<OrderDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/orders/{id}',
            path: {
                'id': id,
            },
            query: {
                'IncludeUser': includeUser,
                'IncludeRegistration': includeRegistration,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putV3Orders(
        id: number,
        requestBody?: OrderUpdateRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/orders/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3Orders(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/orders/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param userId
     * @param eventId
     * @param registrationId
     * @param status
     * @param includeUser
     * @param includeRegistration
     * @param page
     * @param count
     * @param limit
     * @param offset
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Orders1(
        userId?: string,
        eventId?: number,
        registrationId?: number,
        status?: OrderStatus,
        includeUser?: boolean,
        includeRegistration?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/orders',
            query: {
                'UserId': userId,
                'EventId': eventId,
                'RegistrationId': registrationId,
                'Status': status,
                'IncludeUser': includeUser,
                'IncludeRegistration': includeRegistration,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postV3Orders(
        requestBody?: NewOrderRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/orders',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
