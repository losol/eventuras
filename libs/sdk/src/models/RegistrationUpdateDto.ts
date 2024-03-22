/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentProvider } from './PaymentProvider';
import type { RegistrationCustomerInfoDto } from './RegistrationCustomerInfoDto';
import type { RegistrationStatus } from './RegistrationStatus';
import type { RegistrationType } from './RegistrationType';
export type RegistrationUpdateDto = {
    status?: RegistrationStatus;
    type?: RegistrationType;
    notes?: string | null;
    customer?: RegistrationCustomerInfoDto;
    paymentMethod?: PaymentProvider;
};

