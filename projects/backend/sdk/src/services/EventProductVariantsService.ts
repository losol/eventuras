/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewProductVariantDto } from '../models/NewProductVariantDto';
import type { ProductVariantDto } from '../models/ProductVariantDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EventProductVariantsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns ProductVariantDto Success
     * @throws ApiError
     */
    public getV3EventsProductsVariants({
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
    }): CancelablePromise<Array<ProductVariantDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/events/{eventId}/products/{productId}/variants',
            path: {
                'eventId': eventId,
                'productId': productId,
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
    public postV3EventsProductsVariants({
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
        requestBody?: NewProductVariantDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/events/{eventId}/products/{productId}/variants',
            path: {
                'eventId': eventId,
                'productId': productId,
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
    public deleteV3EventsProductsVariants({
        eventId,
        productId,
        id,
        eventurasOrgId,
    }: {
        eventId: number,
        productId: number,
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v3/events/{eventId}/products/{productId}/variants/{id}',
            path: {
                'eventId': eventId,
                'productId': productId,
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
