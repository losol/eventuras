/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductDto } from './ProductDto';
import type { ProductVariantDto } from './ProductVariantDto';
export type ProductOrderDto = {
    productId?: number;
    productVariantId?: number | null;
    product?: ProductDto;
    productVariant?: ProductVariantDto;
    quantity?: number;
};

