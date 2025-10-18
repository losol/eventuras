'use client';

import { EventCollectionCreateDto } from '@eventuras/sdk';
import { Form, HiddenInput, Input } from '@eventuras/smartform';
import { Button } from '@eventuras/ratio-ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { publicEnv } from '@/config.client';
import slugify from '@/utils/slugify';

const CollectionCreator: React.FC = () => {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const organizationId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const router = useRouter();

  const createCollection = async (data: EventCollectionCreateDto) => {
    const slug = slugify(data.name);
    data.slug = slug;

    const collection = await apiWrapper(() =>
      eventuras.eventCollection.postV3Eventcollections({
        eventurasOrgId: organizationId,
        requestBody: data,
      })
    );

    router.push(`/admin/collections/${collection.value?.id!}`);
  };

  return (
    <>
      <Button onClick={() => setModalOpen(!modalOpen)}>
        {t('admin.collection.labels.create')}
      </Button>
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)} title={'Add collection'}>
        <Form onSubmit={data => createCollection(data)}>
          <HiddenInput name="organizationId" value={organizationId.toString()} />
          <Input name="name" label={t('common.labels.name')} />
          <Button type="submit">{t('admin.collection.labels.create')}</Button>
        </Form>
      </Dialog>
    </>
  );
};

export default CollectionCreator;
