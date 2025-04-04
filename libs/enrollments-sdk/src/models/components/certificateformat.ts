/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { ClosedEnum } from "../../types/enums.js";

export const CertificateFormat = {
  Json: "Json",
  Html: "Html",
  Pdf: "Pdf",
} as const;
export type CertificateFormat = ClosedEnum<typeof CertificateFormat>;

/** @internal */
export const CertificateFormat$inboundSchema: z.ZodNativeEnum<
  typeof CertificateFormat
> = z.nativeEnum(CertificateFormat);

/** @internal */
export const CertificateFormat$outboundSchema: z.ZodNativeEnum<
  typeof CertificateFormat
> = CertificateFormat$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CertificateFormat$ {
  /** @deprecated use `CertificateFormat$inboundSchema` instead. */
  export const inboundSchema = CertificateFormat$inboundSchema;
  /** @deprecated use `CertificateFormat$outboundSchema` instead. */
  export const outboundSchema = CertificateFormat$outboundSchema;
}
