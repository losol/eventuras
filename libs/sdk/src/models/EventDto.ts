/* generated using openapi-typescript-codegen -- do not edit */
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
    lastCancellationDate?: LocalDate;
    featuredImageUrl?: string | null;
    featuredImageCaption?: string | null;
    headline?: string | null;
    published?: boolean;
    moreInformation?: string | null;
    welcomeLetter?: string | null;
    informationRequest?: string | null;
    certificateTitle?: string | null;
    certificateDescription?: string | null;
    projectCode?: string | null;
    organizerUserId?: string | null;
    maxParticipants?: number | null;
    externalInfoPageUrl?: string | null;
};

