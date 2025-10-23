import { OrderLineModel } from "@/lib/eventuras-sdk";

/**
 * Convert selected products map to OrderLineModel array
 * Helper function for registration actions
 */
export const productMapToOrderLineModel = (
  selectedProducts?: Map<string, number>
): OrderLineModel[] => {
  return selectedProducts
    ? (Array.from(selectedProducts, ([productId, quantity]) => ({
        productId: parseInt(productId, 10),
        quantity,
      })) as OrderLineModel[])
    : [];
};
