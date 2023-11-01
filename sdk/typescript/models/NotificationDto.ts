/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Instant } from './Instant';
import type { NotificationStatisticsDto } from './NotificationStatisticsDto';
import type { NotificationStatus } from './NotificationStatus';
import type { NotificationType } from './NotificationType';

export type NotificationDto = {
    readonly notificationId?: number;
    readonly organizationId?: number | null;
    readonly eventId?: number | null;
    readonly productId?: number | null;
    readonly registrationId?: number | null;
    readonly message?: string | null;
    created?: Instant;
    statusUpdated?: Instant;
    type?: NotificationType;
    status?: NotificationStatus;
    statistics?: NotificationStatisticsDto;
};

