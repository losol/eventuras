/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegistrationStatus } from './RegistrationStatus';
import type { UserSummaryDto } from './UserSummaryDto';
export type ProductOrdersSummaryDto = {
    registrationId?: number;
    registrationStatus?: RegistrationStatus;
    user?: UserSummaryDto;
    orderIds?: Array<number> | null;
    sumQuantity?: number;
};

