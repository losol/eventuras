/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewRegistrationOrderDto } from '../models/NewRegistrationOrderDto';
import type { OrderDto } from '../models/OrderDto';
import type { OrderUpdateRequestDto } from '../models/OrderUpdateRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RegistrationOrdersService {

    /**
     * @returns OrderDto Success
     * @throws ApiError
     */
    public static getV3RegistrationsOrders({
        id,
    }: {
        id: number,
    }): CancelablePromise<Array<OrderDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations/{id}/orders',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postV3RegistrationsOrders({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: NewRegistrationOrderDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations/{id}/orders',
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
    public static postV3RegistrationsProducts({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: OrderUpdateRequestDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/registrations/{id}/products',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
