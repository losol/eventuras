import { LocalDate } from '@losol/eventuras';
import createTranslation from 'next-translate/createTranslation';

import Card from '@/components/ui/Card';
import { Definition, DescriptionList, Item, Term } from '@/components/ui/DescriptionList';
import Heading from '@/components/ui/Heading';
import { formatDateSpan } from '@/utils/formatDate';

export type CertificateDto = {
  readonly certificateId?: number;
  readonly certificateGuid?: string;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly comment?: string | null;
  readonly recipientName?: string | null;
  readonly evidenceDescription?: string | null;
  readonly issuedInCity?: string | null;
  issuingDate?: LocalDate;
  readonly issuerOrganizationName?: string | null;
  readonly issuerOrganizationLogoBase64?: string | null;
  readonly issuerPersonName?: string | null;
  readonly issuerPersonSignatureImageBase64?: string | null;
};

type CertificateProps = {
  certificate: CertificateDto;
};

const Certificate: React.FC<CertificateProps> = ({ certificate }) => {
  const { t } = createTranslation();

  return (
    <Card>
      <Heading>Kursbevis</Heading>
      <Heading as="h2">Event title</Heading>
      <DescriptionList>
        <Item>
          <Term>{t('common:labels.id')}</Term>
          <Definition>{certificate.certificateId}</Definition>
        </Item>
        <Item>
          <Term>{t('common:labels.guid')}</Term>
          <Definition>{certificate.certificateId}</Definition>
        </Item>
        <Item>
          <Term>{t('common:order.labels.date')}</Term>
          <Definition>{formatDateSpan(certificate.issuingDate!.toString())}</Definition>
        </Item>
        <Item>
          <Term>{t('common:labels.name')}</Term>
          <Definition>{certificate.recipientName}</Definition>
        </Item>
      </DescriptionList>
    </Card>
  );
};

export default Certificate;
