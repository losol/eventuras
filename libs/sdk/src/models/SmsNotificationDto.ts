/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventParticipantsFilterDto } from './EventParticipantsFilterDto';
export type SmsNotificationDto = {
    recipients?: Array<string> | null;
    eventParticipants?: EventParticipantsFilterDto;
    registrationId?: number | null;
    message: string;
};

