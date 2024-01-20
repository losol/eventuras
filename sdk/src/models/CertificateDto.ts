/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalDate } from './LocalDate';
export type CertificateDto = {
    readonly certificateId?: number;
    readonly certificateGuid?: string;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly comment?: string | null;
    readonly recipientName?: string | null;
    readonly evidenceDescription?: string | null;
    readonly issuedInCity?: string | null;
    issuingDate?: LocalDate;
    readonly issuerOrganizationName?: string | null;
    readonly issuerOrganizationLogoBase64?: string | null;
    readonly issuerPersonName?: string | null;
    readonly issuerPersonSignatureImageBase64?: string | null;
};

