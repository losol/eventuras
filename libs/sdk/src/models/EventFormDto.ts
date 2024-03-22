/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventInfoOptionsDto } from './EventInfoOptionsDto';
import type { EventInfoStatus } from './EventInfoStatus';
import type { EventInfoType } from './EventInfoType';
import type { LocalDate } from './LocalDate';
/**
 * Data Transfer Object (DTO) for Event Information.
 * Used for API between the backend and the frontend.
 */
export type EventFormDto = {
    title: string;
    slug: string;
    id?: number | null;
    type?: EventInfoType;
    status?: EventInfoStatus;
    organizationId?: number;
    headline?: string | null;
    moreInformation?: string | null;
    category?: string | null;
    description?: string | null;
    manageRegistrations?: boolean;
    onDemand?: boolean;
    featured?: boolean;
    program?: string | null;
    practicalInformation?: string | null;
    location?: string | null;
    city?: string | null;
    dateStart?: LocalDate;
    dateEnd?: LocalDate;
    welcomeLetter?: string | null;
    published?: boolean;
    externalInfoPageUrl?: string | null;
    externalRegistrationsUrl?: string | null;
    informationRequest?: string | null;
    lastRegistrationDate?: LocalDate;
    lastCancellationDate?: LocalDate;
    maxParticipants?: number | null;
    certificateTitle?: string | null;
    certificateDescription?: string | null;
    featuredImageUrl?: string | null;
    featuredImageCaption?: string | null;
    projectCode?: string | null;
    organizerUserId?: string | null;
    options?: EventInfoOptionsDto;
};

