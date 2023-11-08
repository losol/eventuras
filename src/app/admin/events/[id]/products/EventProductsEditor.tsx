'use client';

import type { EventDto, NewProductDto, ProductDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { useCallback, useState } from 'react';

import Button from '@/components/ui/Button';
import createSDK from '@/utils/createSDK';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

import AddProductModal from './AddProductModal';
import { ProductTable } from './ProductTable';

interface EventProductsEditorProps {
  eventInfo: EventDto;
  products: ProductDto[];
}

const EventProductsEditor: React.FC<EventProductsEditorProps> = ({
  eventInfo,
  products: initialProducts,
}) => {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>(initialProducts); // Use state to manage products
  const { t } = createTranslation();
  const eventuras = createSDK({ baseUrl: Environment.NEXT_PUBLIC_API_BASE_URL });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    const updatedProducts = await eventuras.eventProducts.getV3EventsProducts({
      eventId: eventInfo.id!,
    });
    setProducts(updatedProducts);
  }, [eventuras.eventProducts, eventInfo.id]);

  const handleAddProduct = async (newProduct: NewProductDto) => {
    Logger.info({ namespace: 'addproduct' }, 'Adding new product');
    await eventuras.eventProducts.postV3EventsProducts({
      eventId: eventInfo.id!,
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
      requestBody: newProduct,
    });

    // Refresh the list of products after adding a new one
    await fetchProducts();

    // Close the modal
    setIsAddProductModalOpen(false);
  };

  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);

  return (
    <div>
      <Button onClick={openAddProductModal}>{t('admin:products.labels.addnewproduct')}</Button>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={closeAddProductModal}
        onSubmit={handleAddProduct}
      />

      <ProductTable products={products} />
    </div>
  );
};

export default EventProductsEditor;
