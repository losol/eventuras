'use client';

import { Dialog } from '@headlessui/react';
import type { NewProductDto } from '@losol/eventuras';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Logger from '@/utils/Logger';

import ConfirmDiscardModal from './ConfirmDiscardModal';

interface AddProductModalProps {
  isOpen: boolean;
  onSubmit: (values: NewProductDto) => void;
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<NewProductDto>();

  const handleFormSubmit = handleSubmit(data => {
    Logger.info({ namespace: 'addproduct' }, data);

    // Submit...
    onSubmit(data);

    // And close the modal
    onClose();
  });

  const handleCloseClick = () => {
    if (isDirty) {
      setConfirmDiscardChanges(true);
    } else {
      // Just close if nothing was changed
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleCloseClick}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
              Add New Product
            </Dialog.Title>
            <form onSubmit={handleFormSubmit} className="mt-2">
              <input
                {...register('name')}
                placeholder="Product Name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {/* TODO: add some more fields */}
              <div className="mt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <ConfirmDiscardModal
        isOpen={confirmDiscardChanges}
        onClose={() => setConfirmDiscardChanges(false)}
        onConfirm={onClose}
        title="Discard Changes?"
        description="Are you sure you want to discard your changes?"
      />
    </>
  );
};

export default AddProductModal;
