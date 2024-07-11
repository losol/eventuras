import Checkbox, { CheckBoxDescription, CheckBoxLabel } from '@eventuras/forms/src/inputs/Checkbox';
import { ProductDto } from '@eventuras/sdk';
import { DATA_TEST_ID } from '@eventuras/utils';

import { ProductSelected } from '@/types';

export type ProductSelectionProps = {
  products: ProductDto[];
  selectedProducts: ProductSelected[];
  register: any;
  isAdmin?: boolean;
};
const ProductSelection = ({
  products,
  register,
  selectedProducts,
  isAdmin,
}: ProductSelectionProps) => {
  return (
    <>
      {products.map((product: ProductDto) => {
        if (!product.enableQuantity) {
          return (
            <Checkbox
              key={product.productId}
              {...{ [DATA_TEST_ID]: 'product-selection-checkbox' }}
              id={product.productId}
              title={product.name}
              description={product.description}
              {...register(`products.${product.productId}`)}
              disabled={product.isMandatory && !isAdmin}
              defaultChecked={
                (product.isMandatory && !isAdmin) ||
                selectedProducts.filter(selProd => {
                  return selProd.productId === product.productId;
                }).length > 0
              }
            >
              <CheckBoxLabel>{product.name}</CheckBoxLabel>
              <CheckBoxDescription>{product.description}</CheckBoxDescription>
            </Checkbox>
          );
        }
        return (
          <div key={product.productId}>
            <input
              type="number"
              className="w-16 mb-3 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue={product.minimumQuantity}
              min={isAdmin ? 0 : product.minimumQuantity}
              value={product.productId}
              {...register(`products.${product.productId}`, {
                min: isAdmin
                  ? null
                  : {
                      value: product.minimumQuantity,
                      message: `Minimum is ${product.minimumQuantity}`,
                    },
              })}
            />
            <label htmlFor={product.productId?.toString()}>{product.name}</label>
            <p>{product.description}</p>
          </div>
        );
      })}
    </>
  );
};

export default ProductSelection;
