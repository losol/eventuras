/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProductVariantDto } from './ProductVariantDto';
import type { ProductVisibility } from './ProductVisibility';

export type ProductDto = {
    productId?: number;
    name?: string | null;
    description?: string | null;
    more?: string | null;
    price?: number;
    vatPercent?: number;
    visibility?: ProductVisibility;
    variants?: Array<ProductVariantDto> | null;
    minimumQuantity?: number;
    readonly isMandatory?: boolean;
    enableQuantity?: boolean;
};

