/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductDto } from './ProductDto';
import type { ProductVariantDto } from './ProductVariantDto';
export type OrderLineDto = {
    orderLineId?: number;
    product?: ProductDto;
    productVariant?: ProductVariantDto;
    quantity?: number;
};

