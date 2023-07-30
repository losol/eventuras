/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PaymentProvider } from './PaymentProvider';
import type { RegistrationCustomerInfoDto } from './RegistrationCustomerInfoDto';
import type { RegistrationType } from './RegistrationType';

export type RegistrationFormDto = {
    customer?: RegistrationCustomerInfoDto;
    notes?: string | null;
    type?: RegistrationType;
    paymentMethod?: PaymentProvider;
    readonly empty?: boolean;
};

