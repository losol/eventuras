/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventInfoStatus } from './EventInfoStatus';
import type { EventInfoType } from './EventInfoType';
import type { LocalDate } from './LocalDate';

export type EventDto = {
    id?: number;
    type?: EventInfoType;
    status?: EventInfoStatus;
    title?: string | null;
    slug?: string | null;
    category?: string | null;
    description?: string | null;
    featured?: boolean;
    program?: string | null;
    practicalInformation?: string | null;
    location?: string | null;
    city?: string | null;
    onDemand?: boolean;
    dateStart?: LocalDate;
    dateEnd?: LocalDate;
    lastRegistrationDate?: LocalDate;
};

