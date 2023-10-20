/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewUserDto } from '../models/NewUserDto';
import type { UserFormDto } from '../models/UserFormDto';
import type { UserListOrder } from '../models/UserListOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Gets information about the current user. Creates a new user if no user with the email exists.
     * @returns any Success
     * @throws ApiError
     */
    public static getV3UsersMe({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users/me',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Users({
        id,
        eventurasOrgId,
    }: {
        id: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users/{id}',
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
    public static putV3Users({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: UserFormDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/users/{id}',
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
    public static getV3Users1({
        query,
        order,
        descending,
        page,
        count,
        limit,
        offset,
        eventurasOrgId,
    }: {
        query?: string,
        order?: UserListOrder,
        descending?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'Query': query,
                'Order': order,
                'Descending': descending,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postV3Users({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewUserDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/users',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
