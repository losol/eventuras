/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserDto } from '../models/UserDto';
import type { UserFormDto } from '../models/UserFormDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UserProfileService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Gets information about the current user. Creates a new user if no user with the email exists.
     * @returns UserDto Success
     * @throws ApiError
     */
    public getV3Userprofile({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/userprofile',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns UserDto Success
     * @throws ApiError
     */
    public putV3Userprofile({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        id?: string,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        requestBody?: UserFormDto,
    }): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/v3/userprofile',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
