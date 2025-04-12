import { CertificateDto } from '@eventuras/sdk';
import { Definition, DescriptionList, Heading, Item, Term } from '@eventuras/ui';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import Card from '@/components/Card';
import { formatDateSpan } from '@/utils/formatDate';

type CertificateProps = {
  certificate: CertificateDto;
};

const Certificate: React.FC<CertificateProps> = ({ certificate }) => {
  const t = await getTranslations();

  return (
    <Card>
      <Heading>Kursbevis</Heading>
      <Heading as="h2">Event title</Heading>
      <DescriptionList>
        <Item>
          <Term>{t('common.labels.id')}</Term>
          <Definition>{certificate.certificateId}</Definition>
        </Item>
        <Item>
          <Term>{t('common.labels.guid')}</Term>
          <Definition>{certificate.certificateGuid}</Definition>
        </Item>
        <Item>
          <Term>{t('common.order.labels.date')}</Term>
          <Definition>{formatDateSpan(certificate.issuingDate!.toString())}</Definition>
        </Item>
        <Item>
          <Term>{t('common.labels.name')}</Term>
          <Definition>{certificate.recipientName}</Definition>
        </Item>
      </DescriptionList>
    </Card>
  );
};

export default Certificate;
