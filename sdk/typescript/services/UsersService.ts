/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewUserDto } from '../models/NewUserDto';
import type { UserDtoPageResponseDto } from '../models/UserDtoPageResponseDto';
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
    public static getV3UsersMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users/me',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getV3Users({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putV3Users({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: UserFormDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * @returns UserDtoPageResponseDto Success
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
    }: {
        query?: string,
        order?: UserListOrder,
        descending?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
    }): CancelablePromise<UserDtoPageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/users',
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
        requestBody,
    }: {
        requestBody?: NewUserDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/users',
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

}
