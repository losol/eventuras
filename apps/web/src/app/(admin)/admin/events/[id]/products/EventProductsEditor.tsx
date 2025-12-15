'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Plus } from '@eventuras/ratio-ui/icons';
import { Box } from '@eventuras/ratio-ui/layout/Box';

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
    <Box gap="6" className="flex flex-col">
      {/* Header with action */}
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between" gap="4">
        <Button
          testId="add-product-button"
          onClick={() => openProductModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          {t('admin.products.labels.addnewproduct')}
        </Button>
      </Box>

      {/* Product table */}
      {products.length > 0 ? (
        <ProductTable eventId={eventInfo.id!} products={products} onEdit={openProductModal} />
      ) : (
        <Card
          className="text-center border border-dashed border-gray-300 dark:border-gray-700"
          backgroundColorClass="bg-gray-50 dark:bg-gray-800/50"
          padding="py-12 px-6"
        >
          <Text as="p" className="text-gray-500 dark:text-gray-400">
            {t('admin.products.labels.noproducts', {
              defaultValue: 'No products configured yet. Add your first product to get started.',
            })}
          </Text>
        </Card>
      )}

      <ProductModal
        isOpen={productModalOpen}
        onClose={closeProductModal}
        onSubmit={() => onSubmit()}
        product={currentProduct}
        eventId={eventInfo.id!}
      />
    </Box>
  );
};
export default EventProductsEditor;
