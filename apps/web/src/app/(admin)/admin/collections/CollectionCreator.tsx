'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { useToast } from '@eventuras/ratio-ui/toast';
import { Form, HiddenInput, TextField } from '@eventuras/smartform';

import { EventCollectionCreateDto } from '@/lib/eventuras-sdk';

import { createCollection } from './actions';

const logger = Logger.create({
  namespace: 'web:admin:collections',
  context: { component: 'CollectionCreator' },
});

const CollectionCreator: React.FC<{ organizationId: number }> = ({ organizationId }) => {
  const t = useTranslations();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const handleCreateCollection = async (data: EventCollectionCreateDto) => {
    setIsSubmitting(true);
    try {
      const result = await createCollection(data);
      if (result.success && result.data?.collectionId) {
        setModalOpen(false);
        router.push(`/admin/collections/${result.data.collectionId}`);
        router.refresh();
      } else if (!result.success) {
        logger.error(
          {
            organizationId,
            error: result.error,
            name: data.name,
          },
          'Failed to create collection'
        );
        toast.error(result.error.message);
      }
    } catch (error) {
      logger.error(
        {
          organizationId,
          error,
          name: data.name,
        },
        'Unexpected error creating collection'
      );
      toast.error('Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Button onClick={() => setModalOpen(!modalOpen)}>
        {t('admin.collection.labels.create')}
      </Button>
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <Dialog.Heading>Add collection</Dialog.Heading>
        <Dialog.Content>
          <Form onSubmit={data => handleCreateCollection(data as EventCollectionCreateDto)}>
            <HiddenInput name="organizationId" value={organizationId.toString()} />
            <TextField name="name" label={t('common.labels.name')} />
            <Button type="submit" loading={isSubmitting}>
              {t('admin.collection.labels.create')}
            </Button>
          </Form>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
export default CollectionCreator;
