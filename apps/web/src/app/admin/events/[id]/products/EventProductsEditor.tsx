'use client';

import type { EventDto, NewProductDto, ProductDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { useCallback, useState } from 'react';

import Button from '@/components/ui/Button';
import { createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

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
  const { t } = createTranslation();
  const eventuras = createSDK({ baseUrl: Environment.NEXT_PUBLIC_API_BASE_URL });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    const updatedProducts = await eventuras.eventProducts.getV3EventsProducts({
      eventId: eventInfo.id!,
    });
    setProducts(updatedProducts);
  }, [eventuras.eventProducts, eventInfo.id]);

  const handleAddOrEditProduct = async (product: NewProductDto | ProductDto) => {
    if ('productId' in product) {
      Logger.info({ namespace: 'products' }, 'Editing product');
      const result = await eventuras.eventProducts.putV3EventsProducts({
        eventId: eventInfo.id!,
        productId: product.productId!,
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
        requestBody: product,
      });
      Logger.info({ namespace: 'products' }, 'Result:', result);
    } else {
      Logger.info({ namespace: 'products' }, 'Adding new product');
      const result = await eventuras.eventProducts.postV3EventsProducts({
        eventId: eventInfo.id!,
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
        requestBody: product! as NewProductDto,
      });
      Logger.info({ namespace: 'products' }, 'Result:', result);
    }

    // Refresh the list of products after adding or editing
    await fetchProducts();

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
      <Button data-test-id="add-product-button" onClick={() => openProductModal()}>
        {t('admin:products.labels.addnewproduct')}
      </Button>

      <ProductModal
        isOpen={productModalOpen}
        onClose={closeProductModal}
        onSubmit={handleAddOrEditProduct}
        product={currentProduct}
      />

      <ProductTable products={products} onEdit={openProductModal} />
    </div>
  );
};

export default EventProductsEditor;
