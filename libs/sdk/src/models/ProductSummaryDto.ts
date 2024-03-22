/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVisibility } from './ProductVisibility';
export type ProductSummaryDto = {
    productId?: number | null;
    eventId?: number | null;
    name?: string | null;
    description?: string | null;
    more?: string | null;
    price?: number;
    vatPercent?: number;
    visibility?: ProductVisibility;
    minimumQuantity?: number;
    isMandatory?: boolean | null;
    enableQuantity?: boolean;
};

