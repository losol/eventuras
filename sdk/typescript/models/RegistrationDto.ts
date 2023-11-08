/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventDto } from './EventDto';
import type { OrderDto } from './OrderDto';
import type { ProductOrderDto } from './ProductOrderDto';
import type { RegistrationStatus } from './RegistrationStatus';
import type { RegistrationType } from './RegistrationType';
import type { UserDto } from './UserDto';
export type RegistrationDto = {
    registrationId?: number;
    eventId?: number;
    userId?: string | null;
    status?: RegistrationStatus;
    type?: RegistrationType;
    certificateId?: number | null;
    notes?: string | null;
    user?: UserDto;
    event?: EventDto;
    products?: Array<ProductOrderDto> | null;
    orders?: Array<OrderDto> | null;
};

