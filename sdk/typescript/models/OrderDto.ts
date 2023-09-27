/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderLineDto } from './OrderLineDto';
import type { OrderRegistrationDto } from './OrderRegistrationDto';
import type { OrderStatus } from './OrderStatus';
import type { UserDto } from './UserDto';

export type OrderDto = {
    orderId?: number;
    status?: OrderStatus;
    time?: string;
    userId?: string | null;
    registrationId?: number;
    items?: Array<OrderLineDto> | null;
    registration?: OrderRegistrationDto;
    user?: UserDto;
};

