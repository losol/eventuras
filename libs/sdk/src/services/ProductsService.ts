/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductDeliverySummaryDto } from '../models/ProductDeliverySummaryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ProductsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns ProductDeliverySummaryDto Success
     * @throws ApiError
     */
    public getV3ProductsSummary({
        productId,
        eventurasOrgId,
    }: {
        productId: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<ProductDeliverySummaryDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/products/{productId}/summary',
            path: {
                'productId': productId,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
