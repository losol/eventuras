/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrdersSummaryDto } from './ProductOrdersSummaryDto';
import type { ProductSummaryDto } from './ProductSummaryDto';
export type ProductDeliverySummaryDto = {
    product?: ProductSummaryDto;
    orderSummary?: Array<ProductOrdersSummaryDto> | null;
};

