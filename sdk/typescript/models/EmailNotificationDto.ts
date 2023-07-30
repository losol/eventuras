/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventParticipantsFilterDto } from './EventParticipantsFilterDto';

export type EmailNotificationDto = {
    recipients?: Array<string> | null;
    eventParticipants?: EventParticipantsFilterDto;
    subject: string;
    bodyMarkdown: string;
};

