/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrdersSummaryDto } from './ProductOrdersSummaryDto';
import type { ProductStatisticsDto } from './ProductStatisticsDto';
import type { ProductSummaryDto } from './ProductSummaryDto';
export type ProductDeliverySummaryDto = {
    product?: ProductSummaryDto;
    orderSummary?: Array<ProductOrdersSummaryDto> | null;
    statistics?: ProductStatisticsDto;
};

