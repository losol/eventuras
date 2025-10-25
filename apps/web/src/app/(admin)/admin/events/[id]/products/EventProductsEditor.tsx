'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';

import type { EventDto, ProductDto } from '@/lib/eventuras-sdk';

import { fetchEventProducts } from './actions';
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
  const refreshProducts = async () => {
    const result = await fetchEventProducts(eventInfo.id!);
    if (result.success && result.data) {
      setProducts(result.data);
    }
  };
  const onSubmit = async () => {
    // Refresh the list of products after adding or editing
    await refreshProducts();
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
      <Button testId="add-product-button" onClick={() => openProductModal()}>
        {t('admin.products.labels.addnewproduct')}
      </Button>
      <ProductModal
        isOpen={productModalOpen}
        onClose={closeProductModal}
        onSubmit={() => onSubmit()}
        product={currentProduct}
        eventId={eventInfo.id!}
      />
      <ProductTable eventId={eventInfo.id!} products={products} onEdit={openProductModal} />
    </div>
  );
};
export default EventProductsEditor;
