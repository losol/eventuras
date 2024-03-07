/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalDate } from './LocalDate';
import type { OrganizationMemberDto } from './OrganizationMemberDto';
export type UserDto = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    givenName?: string | null;
    middleName?: string | null;
    familyName?: string | null;
    nameVerified?: boolean;
    pictureUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    birthDate?: LocalDate;
    birthDateVerified?: boolean;
    profession?: string | null;
    jobRole?: string | null;
    employer?: string | null;
    employerIdentificationNumber?: string | null;
    professionalIdentityNumber?: string | null;
    professionalIdentityNumberVerified?: boolean;
    supplementaryInformation?: string | null;
    organizationMembership?: Array<OrganizationMemberDto> | null;
    archived?: boolean;
};

