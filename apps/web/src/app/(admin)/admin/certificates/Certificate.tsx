import React from 'react';
import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Definition, DescriptionList, Item, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { CertificateDto } from "@/lib/eventuras-sdk";
type CertificateProps = {
  certificate: CertificateDto;
};
const Certificate: React.FC<CertificateProps> = ({ certificate }) => {
  const t = useTranslations();
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
