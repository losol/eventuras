/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RegistrationCertificateService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any Success
     * @throws ApiError
     */
    public postV3RegistrationsCertificateSend({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/registrations/{id}/certificate/send',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
