import { EventDto } from '@eventuras/sdk';
import { Button, Definition, DescriptionList, Drawer, Heading, Term } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import { appConfig } from '@/config.server';

type AdminCertificatesActionsMenuProps = {
  eventinfo: EventDto;
  onCertificatesSent?: () => void;
};

export const AdminCertificatesActionsMenu: React.FC<AdminCertificatesActionsMenuProps> = ({
  eventinfo,
  onCertificatesSent,
}) => {
  const [certificateDrawerOpen, setCertificateDrawerOpen] = useState<boolean>(false);
  const t = useTranslations();
  const loggerOptions = { namespace: 'admin:certificates' };

  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  const onClose = () => {
    setCertificateDrawerOpen(false);
  };

  const onCertificateSubmit = async () => {
    Logger.info(loggerOptions, 'Sending certificates...');

    const result = await apiWrapper(() => {
      return eventuras.eventCertificates.postV3EventCertificatesIssue({
        id: eventinfo.id!,
        send: true,
        eventurasOrgId: parseInt(appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string),
      });
    });
    onCertificatesSent && onCertificatesSent();
    onClose();
  };

  return (
    <>
      <Button onClick={() => setCertificateDrawerOpen(!certificateDrawerOpen)} variant="outline">
        {t('admin.labels.sendCertificates')}
      </Button>
      <Drawer isOpen={certificateDrawerOpen} onCancel={() => onClose()}>
        <Drawer.Header>
          <Heading as="h2">Certificate details</Heading>
        </Drawer.Header>
        <Drawer.Body>
          <DescriptionList>
            <Term>Certificate title:</Term>
            <Definition>{eventinfo.certificateTitle}</Definition>
            <Term>Certificate description:</Term>
            <Definition>{eventinfo.certificateDescription}</Definition>
          </DescriptionList>
        </Drawer.Body>
        <Drawer.Footer>
          <Button onClick={onCertificateSubmit}>Send certificates</Button>
          <Button onClick={() => onClose()} variant="secondary">
            Close
          </Button>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
