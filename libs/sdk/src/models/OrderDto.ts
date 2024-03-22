/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderLineDto } from './OrderLineDto';
import type { OrderStatus } from './OrderStatus';
import type { PaymentProvider } from './PaymentProvider';
import type { RegistrationDto } from './RegistrationDto';
import type { UserDto } from './UserDto';
export type OrderDto = {
    orderId?: number;
    status?: OrderStatus;
    time?: string;
    userId?: string | null;
    registrationId?: number;
    paymentMethod?: PaymentProvider;
    comments?: string | null;
    log?: string | null;
    items?: Array<OrderLineDto> | null;
    registration?: RegistrationDto;
    user?: UserDto;
};

