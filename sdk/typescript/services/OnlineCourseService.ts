/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnlineCourseDto } from '../models/OnlineCourseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OnlineCourseService {

    /**
     * @returns OnlineCourseDto Success
     * @throws ApiError
     */
    public static getV3Onlinecourses(): CancelablePromise<Array<OnlineCourseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/onlinecourses',
        });
    }

    /**
     * @returns OnlineCourseDto Success
     * @throws ApiError
     */
    public static getV3Onlinecourses1({
        id,
    }: {
        id: number,
    }): CancelablePromise<OnlineCourseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/onlinecourses/{id}',
            path: {
                'id': id,
            },
        });
    }

}
