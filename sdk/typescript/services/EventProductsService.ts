/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewProductDto } from '../models/NewProductDto';
import type { ProductDto } from '../models/ProductDto';
import type { ProductFormDto } from '../models/ProductFormDto';
import type { ProductVisibility } from '../models/ProductVisibility';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventProductsService {

    /**
     * @returns ProductDto Success
     * @throws ApiError
     */
    public static getV3EventsProducts({
        eventId,
        visibility,
        eventurasOrgId,
    }: {
        eventId: number,
        visibility?: ProductVisibility,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<ProductDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events/{eventId}/products',
            path: {
                'eventId': eventId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'Visibility': visibility,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postV3EventsProducts({
        eventId,
        eventurasOrgId,
        requestBody,
    }: {
        eventId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewProductDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/events/{eventId}/products',
            path: {
                'eventId': eventId,
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
    public static putV3EventsProducts({
        eventId,
        productId,
        eventurasOrgId,
        requestBody,
    }: {
        eventId: number,
        productId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: ProductFormDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/events/{eventId}/products/{productId}',
            path: {
                'eventId': eventId,
                'productId': productId,
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
    public static deleteV3EventsProducts({
        eventId,
        productId,
        eventurasOrgId,
    }: {
        eventId: number,
        productId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/events/{eventId}/products/{productId}',
            path: {
                'eventId': eventId,
                'productId': productId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

}
