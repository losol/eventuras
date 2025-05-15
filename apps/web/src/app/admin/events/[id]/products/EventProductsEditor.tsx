'use client';

import type { EventDto, ProductDto } from '@eventuras/sdk';
import { Button } from '@eventuras/ratio-ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import ProductModal from './ProductModal';
import { ProductTable } from './ProductTable';

interface EventProductsEditorProps {
  eventInfo: EventDto;
  products: ProductDto[];
}

const EventProductsEditor: React.FC<EventProductsEditorProps> = ({
  eventInfo,
  products: initialProducts,
}) => {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>(initialProducts);
  const [currentProduct, setCurrentProduct] = useState<ProductDto | undefined>();
  const t = useTranslations();
  const eventuras = createSDK({ baseUrl: Environment.NEXT_PUBLIC_API_BASE_URL });

  const onSubmit = async () => {
    // Refresh the list of products after adding or editing
    const updatedProducts = await eventuras.eventProducts.getV3EventsProducts({
      eventId: eventInfo.id!,
    });
    setProducts(updatedProducts);

    // Close the modal
    setProductModalOpen(false);
  };

  const openProductModal = (product?: ProductDto) => {
    setCurrentProduct(product || undefined);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setCurrentProduct(undefined);
    setProductModalOpen(false);
  };

  return (
    <div>
      <Button {...{ [DATA_TEST_ID]: 'add-product-button' }} onClick={() => openProductModal()}>
        {t('admin.products.labels.addnewproduct')}
      </Button>

      <ProductModal
        isOpen={productModalOpen}
        onClose={closeProductModal}
        onSubmit={() => onSubmit()}
        product={currentProduct}
        eventId={eventInfo.id!}
      />

      <ProductTable products={products} onEdit={openProductModal} />
    </div>
  );
};

export default EventProductsEditor;
