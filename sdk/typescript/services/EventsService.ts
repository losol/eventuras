/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventDto } from '../models/EventDto';
import type { EventDtoPageResponseDto } from '../models/EventDtoPageResponseDto';
import type { EventFormDto } from '../models/EventFormDto';
import type { EventFormDtoJsonPatchDocument } from '../models/EventFormDtoJsonPatchDocument';
import type { EventInfoType } from '../models/EventInfoType';
import type { LocalDate } from '../models/LocalDate';
import type { PeriodMatchingKind } from '../models/PeriodMatchingKind';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class EventsService {

    /**
     * Retrieves a list of events based on the given query.
     * @returns EventDtoPageResponseDto Success
     * @throws ApiError
     */
    public static getV3Events({
        type,
        start,
        end,
        period,
        includePastEvents,
        includeDraftEvents,
        organizationId,
        page,
        count,
        limit,
        offset,
        eventurasOrgId,
    }: {
        type?: EventInfoType,
        start?: LocalDate,
        end?: LocalDate,
        period?: PeriodMatchingKind,
        includePastEvents?: boolean,
        includeDraftEvents?: boolean,
        organizationId?: number,
        page?: number,
        count?: number,
        limit?: number,
        offset?: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<EventDtoPageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            query: {
                'Type': type,
                'Start': start,
                'End': end,
                'Period': period,
                'IncludePastEvents': includePastEvents,
                'IncludeDraftEvents': includeDraftEvents,
                'OrganizationId': organizationId,
                'Page': page,
                'Count': count,
                'Limit': limit,
                'Offset': offset,
            },
        });
    }

    /**
     * Creates a new event.
     * @returns EventDto Success
     * @throws ApiError
     */
    public static postV3Events({
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        /**
         * Event information.
         */
        requestBody?: EventFormDto,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v3/events',
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
            body: requestBody,
            mediaType: 'application/json-patch+json',
        });
    }

    /**
     * Retrieves event details by ID.
     * @returns EventDto Success
     * @throws ApiError
     */
    public static getV3Events1({
        id,
        eventurasOrgId,
    }: {
        /**
         * The ID of the event.
         */
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

    /**
     * Updates an existing event by ID.
     * @returns EventDto Success
     * @throws ApiError
     */
    public static putV3Events({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * The ID of the event.
         */
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        /**
         * Updated event information.
         */
        requestBody?: EventFormDto,
    }): CancelablePromise<EventDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v3/events/{id}',
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
     * Partially updates a specific event by its ID using JSON Patch.
     * @returns any Success
     * @throws ApiError
     */
    public static patchV3Events({
        id,
        eventurasOrgId,
        requestBody,
    }: {
        /**
         * The ID of the event to update.
         */
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
        /**
         * The JSON Patch document with updates.
         */
        requestBody?: EventFormDtoJsonPatchDocument,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v3/events/{id}',
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
     * Deletes an event by ID.
     * @returns any Success
     * @throws ApiError
     */
    public static deleteV3Events({
        id,
        eventurasOrgId,
    }: {
        /**
         * The ID of the event to delete.
         */
        id: number,
        /**
         * Optional organization Id. Will be required in API version 4.
         */
        eventurasOrgId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v3/events/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Eventuras-Org-Id': eventurasOrgId,
            },
        });
    }

}
