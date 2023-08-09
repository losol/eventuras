import { Heading } from 'components/content';
import useTranslation from 'next-translate/useTranslation';
import { useForm } from 'react-hook-form';

export type RegistrationProduct = {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  minimumQuantity: number;
  isBooleanSelection: boolean;
};

export type RegistrationCustomizeProps = {
  products: RegistrationProduct[];
  onSubmit: (values: Map<string, number>) => void;
};

const RegistrationCustomize = ({ products, onSubmit }: RegistrationCustomizeProps) => {
  const { t } = useTranslation('register');
  const { register, handleSubmit } = useForm();
  const onSubmitForm = (data: any) => {
    const submissionMap = new Map<string,number>
    Object.keys(data).forEach((key:string)=>{
      const relatedProduct = products.find(product=>product.id===key)
      if(!relatedProduct)return;
      const formValue = data[key]
      let value = 0
      if(relatedProduct.isBooleanSelection){
        if(relatedProduct.mandatory || !!formValue){
          value = 1
        }
      }else{
        value = parseInt(formValue,10)
      }
      submissionMap.set(key,value)
    })
    onSubmit(submissionMap)
  };

  //TODO once we've settled on UI format, we can componentize all this stuff
  const checkboxClass='class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"'
  const inputClass =
    'w-16 mb-3 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
  return (
    <>
      <Heading>{t('customize.title')}</Heading>
      <p>{t('customize.description')}</p>
      <form onSubmit={handleSubmit(onSubmitForm)} className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {products.map((product: RegistrationProduct) => {
          if (product.isBooleanSelection) {
            return (
              <div key={product.id}>
                <input type="checkbox" className={checkboxClass} id={product.id} {...register(product.id)} disabled={product.mandatory} defaultChecked={product.mandatory}/>
                <label htmlFor={product.id}>{product.title}</label>
                <p>{product.description}</p>
              </div>
            );
          }
          return (
            <div key={product.id}>
            <input
              type="number"
              className={inputClass}
              defaultValue={product.minimumQuantity}
              min={product.minimumQuantity}
              {...register(product.id, {
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
        <button type="submit">Continue</button>
      </form>
    </>
  );
};

export default RegistrationCustomize;
