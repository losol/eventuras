'use client';

interface OrderItemRowLabelProps {
  data?: {
    product?: {
      title?: string;
    };
  };
  rowNumber?: number;
}

export const OrderItemRowLabel = ({ data, rowNumber }: OrderItemRowLabelProps) => {
  return <>{data?.product?.title || `Item ${(rowNumber ?? 0) + 1}`}</>;
};
