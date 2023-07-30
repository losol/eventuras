/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewRegistrationOrderDto } from '../models/NewRegistrationOrderDto';
import type { RegistrationOrderDto } from '../models/RegistrationOrderDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RegistrationOrdersService {

    /**
     * @param id
     * @returns RegistrationOrderDto Success
     * @throws ApiError
     */
    public static getV3RegistrationsOrders(
        id: number,
    ): CancelablePromise<Array<RegistrationOrderDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/registrations/{id}/orders',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postV3RegistrationsOrders(
        id: number,
        requestBody?: NewRegistrationOrderDto,
    ): CancelablePromise<any> {
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

}
