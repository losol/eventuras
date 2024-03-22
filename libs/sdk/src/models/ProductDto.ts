/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVariantDto } from './ProductVariantDto';
import type { ProductVisibility } from './ProductVisibility';
export type ProductDto = {
    productId?: number;
    name?: string | null;
    description?: string | null;
    price?: number;
    vatPercent?: number;
    visibility?: ProductVisibility;
    inventory?: number | null;
    published?: boolean | null;
    variants?: Array<ProductVariantDto> | null;
    minimumQuantity?: number;
    readonly isMandatory?: boolean;
    enableQuantity?: boolean;
};

