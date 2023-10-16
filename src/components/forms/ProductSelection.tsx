import { RegistrationProduct } from '@/types/RegistrationProduct';

import Checkbox, { CheckBoxDescription, CheckBoxLabel } from './Checkbox';
export type ProductSelectionProps = {
  products: RegistrationProduct[];
  register: any;
};
const ProductSelection = ({ products, register }: ProductSelectionProps) => {
  return (
    <>
      {products.map((product: RegistrationProduct) => {
        if (product.isBooleanSelection) {
          return (
            <Checkbox
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              {...register(`products.${product.id}`)}
              disabled={product.mandatory}
              defaultChecked={product.mandatory}
            >
              <CheckBoxLabel>{product.title}</CheckBoxLabel>
              <CheckBoxDescription>{product.description}</CheckBoxDescription>
            </Checkbox>
          );
        }
        return (
          <div key={product.id}>
            <input
              type="number"
              className="w-16 mb-3 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue={product.minimumQuantity}
              min={product.minimumQuantity}
              value={product.id}
              {...register(`products.${product.id}`, {
                min: {
                  value: product.minimumQuantity,
                  message: `Minimum is ${product.minimumQuantity}`,
                },
              })}
            />
            <label htmlFor={product.id}>{product.title}</label>
            <p>{product.description}</p>
          </div>
        );
      })}
    </>
  );
};

export default ProductSelection;
