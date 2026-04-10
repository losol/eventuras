import React from 'react';
import { useTranslations } from 'next-intl';

import { formatDateSpan } from '@eventuras/core/datetime';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';

import { CertificateDto } from '@/lib/eventuras-sdk';
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
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.labels.id')}</DescriptionList.Term>
          <DescriptionList.Definition>{certificate.certificateId}</DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.labels.guid')}</DescriptionList.Term>
          <DescriptionList.Definition>{certificate.certificateGuid}</DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.order.labels.date')}</DescriptionList.Term>
          <DescriptionList.Definition>
            {formatDateSpan(certificate.issuingDate!.toString())}
          </DescriptionList.Definition>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>{t('common.labels.name')}</DescriptionList.Term>
          <DescriptionList.Definition>{certificate.recipientName}</DescriptionList.Definition>
        </DescriptionList.Item>
      </DescriptionList>
    </Card>
  );
};
export default Certificate;
