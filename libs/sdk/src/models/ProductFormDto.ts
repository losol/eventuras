/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVisibility } from './ProductVisibility';
export type ProductFormDto = {
    name?: string | null;
    description?: string | null;
    price?: number;
    vatPercent?: number;
    enableQuantity?: boolean;
    minimumQuantity?: number;
    inventory?: number | null;
    published?: boolean | null;
    visibility?: ProductVisibility;
};

