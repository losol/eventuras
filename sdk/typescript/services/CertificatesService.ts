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
     * @param id
     * @param format
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Certificates(
        id: number,
        format?: CertificateFormat,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/certificates/{id}',
            path: {
                'id': id,
            },
            query: {
                'format': format,
            },
        });
    }

}
