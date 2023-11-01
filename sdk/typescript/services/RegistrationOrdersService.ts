/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewRegistrationOrderDto } from '../models/NewRegistrationOrderDto';
import type { OrderDto } from '../models/OrderDto';
import type { OrderUpdateRequestDto } from '../models/OrderUpdateRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class RegistrationOrdersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns OrderDto Success
     * @throws ApiError
     */
    public getV3RegistrationsOrders({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OrderDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/registrations/{id}/orders',
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
    public postV3RegistrationsOrders({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewRegistrationOrderDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/registrations/{id}/orders',
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
    public postV3RegistrationsProducts({
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
            method: 'POST',
            url: '/v3/registrations/{id}/products',
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

}
