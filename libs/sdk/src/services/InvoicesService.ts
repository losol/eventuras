/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceDto } from '../models/InvoiceDto';
import type { InvoiceRequestDto } from '../models/InvoiceRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class InvoicesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns InvoiceDto Success
     * @throws ApiError
     */
    public getV3Invoices({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<InvoiceDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/invoices/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns InvoiceDto Success
     * @throws ApiError
     */
    public postV3Invoices({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: InvoiceRequestDto,
    }): CancelablePromise<InvoiceDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/invoices',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
