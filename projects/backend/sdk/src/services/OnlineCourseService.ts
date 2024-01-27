/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnlineCourseDto } from '../models/OnlineCourseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OnlineCourseService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns OnlineCourseDto Success
     * @throws ApiError
     */
    public getV3Onlinecourses({
        eventurasOrgId,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<Array<OnlineCourseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/onlinecourses',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
    /**
     * @returns OnlineCourseDto Success
     * @throws ApiError
     */
    public getV3Onlinecourses1({
        id,
        eventurasOrgId,
    }: {
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<OnlineCourseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/onlinecourses/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }
}
