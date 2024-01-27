/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewUserDto } from '../models/NewUserDto';
import type { UserDto } from '../models/UserDto';
import type { UserDtoPageResponseDto } from '../models/UserDtoPageResponseDto';
import type { UserFormDto } from '../models/UserFormDto';
import type { UserListOrder } from '../models/UserListOrder';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UsersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @deprecated
     * Gets information about the current user. Creates a new user if no user with the email exists.
     * @returns UserDto Success
     * @throws ApiError
     */
    public getV3UsersMe({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/users/me',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns UserDto Success
     * @throws ApiError
     */
    public getV3Users({
        id,
        eventurasOrgId,
    }: {
        id: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
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
     * @returns UserDto Success
     * @throws ApiError
     */
    public putV3Users({
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
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/users/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns UserDtoPageResponseDto Success
     * @throws ApiError
     */
    public getV3Users1({
        query,
        order,
        descending,
        page,
        count,
        limit,
        offset,
        ordering,
        eventurasOrgId,
    }: {
        query?: string,
        order?: UserListOrder,
        descending?: boolean,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        ordering?: Array<string>,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<UserDtoPageResponseDto> {
        return this.httpRequest.request({
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
                'Ordering': ordering,
            },
        });
    }
    /**
     * @returns UserDto Success
     * @throws ApiError
     */
    public postV3Users({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: NewUserDto,
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/users',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
