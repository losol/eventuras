/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentProvider } from './PaymentProvider';
import type { RegistrationCustomerInfoDto } from './RegistrationCustomerInfoDto';
import type { RegistrationType } from './RegistrationType';
export type NewRegistrationDto = {
    customer?: RegistrationCustomerInfoDto;
    notes?: string | null;
    type?: RegistrationType;
    paymentMethod?: PaymentProvider;
    readonly empty?: boolean;
    userId: string;
    eventId: number;
    createOrder?: boolean;
    sendWelcomeLetter?: boolean;
};

