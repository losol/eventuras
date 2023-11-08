/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegistrationStatus } from './RegistrationStatus';
import type { RegistrationType } from './RegistrationType';
export type OrderRegistrationDto = {
    registrationId?: number;
    eventId?: number;
    userId?: string | null;
    status?: RegistrationStatus;
    type?: RegistrationType;
    certificateId?: number | null;
    notes?: string | null;
};

