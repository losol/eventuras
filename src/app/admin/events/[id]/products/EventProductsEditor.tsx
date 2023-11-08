'use client';

import type { EventDto, ProductDto } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import Logger from '@/utils/Logger';

import AddProductModal from './AddProductModal';

interface EventProductsEditorProps {
  eventInfo: EventDto;
  products: ProductDto[];
}

const EventProductsEditor: React.FC<EventProductsEditorProps> = ({ eventInfo, products }) => {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const { t } = createTranslation();

  const handleAddProduct = (newProduct: ProductDto) => {
    Logger.info({ namespace: 'addproduct' }, eventInfo, newProduct);
    Logger.info({ namespace: 'addproduct' }, '^should do something more...');
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

      {/* Render the list of products */}
      {products.map((product, index) => (
        <div key={index}>
          {/* TODO some more product details */}
          {product.name}
        </div>
      ))}
    </div>
  );
};

export default EventProductsEditor;
