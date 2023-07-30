/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventInfoStatus } from './EventInfoStatus';
import type { EventInfoType } from './EventInfoType';
import type { LocalDate } from './LocalDate';

export type EventFormDto = {
    title: string;
    slug: string;
    type?: EventInfoType;
    status?: EventInfoStatus;
    organizationId?: number;
    category?: string | null;
    description?: string | null;
    manageRegistrations?: boolean;
    onDemand?: boolean;
    featured?: boolean;
    program?: string | null;
    practicalInformation?: string | null;
    location?: string | null;
    city?: string | null;
    startDate?: LocalDate;
    endDate?: LocalDate;
};

