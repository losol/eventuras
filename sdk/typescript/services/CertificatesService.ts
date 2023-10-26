/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CertificateFormat } from '../models/CertificateFormat';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CertificatesService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Certificates({
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
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
