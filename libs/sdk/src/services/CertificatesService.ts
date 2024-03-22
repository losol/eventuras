/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CertificateDto } from '../models/CertificateDto';
import type { CertificateFormat } from '../models/CertificateFormat';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CertificatesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns CertificateDto Success
     * @throws ApiError
     */
    public getV3Certificates({
        id,
        format,
        eventurasOrgId,
    }: {
        id: number,
        format?: CertificateFormat,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<CertificateDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/certificates/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'format': format,
            },
        });
    }
}
