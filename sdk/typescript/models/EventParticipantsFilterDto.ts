/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RegistrationStatus } from './RegistrationStatus';
import type { RegistrationType } from './RegistrationType';

export type EventParticipantsFilterDto = {
    eventId?: number | null;
    productId?: number | null;
    registrationStatuses?: Array<RegistrationStatus> | null;
    registrationTypes?: Array<RegistrationType> | null;
    readonly isDefined?: boolean;
};

