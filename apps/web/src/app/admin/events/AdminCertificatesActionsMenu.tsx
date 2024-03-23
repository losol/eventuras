import { EventDto } from '@eventuras/sdk';
import { Button, Heading } from '@eventuras/ui';
import { Definition, DescriptionList, Term } from '@eventuras/ui/DescriptionList';
import Dialog from '@eventuras/ui/Dialog';
import React, { useState } from 'react';

import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

type AdminCertificatesActionsMenuProps = {
  eventinfo: EventDto;
};

export const AdminCertificatesActionsMenu: React.FC<AdminCertificatesActionsMenuProps> = ({
  eventinfo,
}) => {
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState<boolean>(false);
  const loggerOptions = { namespace: 'admin:certificates' };

  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  const onCertificateSubmit = async () => {
    Logger.info(loggerOptions, 'Sending certificates...');

    const result = await apiWrapper(() => {
      return eventuras.eventCertificates.postV3EventCertificatesIssue({
        id: eventinfo.id!,
        send: true,
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID),
      });
    });
  };

  return (
    <>
      <Button onClick={() => setCertificatePreviewOpen(!certificatePreviewOpen)} variant="outline">
        Certificate
      </Button>
      <Dialog
        isOpen={certificatePreviewOpen}
        title="Certificate"
        onClose={() => setCertificatePreviewOpen(!certificatePreviewOpen)}
      >
        <Heading as="h2">Certificate details</Heading>
        <DescriptionList>
          <Term>Certificate title:</Term>
          <Definition>{eventinfo.certificateTitle}</Definition>
          <Term>Certificate description:</Term>
          <Definition>{eventinfo.certificateDescription}</Definition>
        </DescriptionList>

        <Button onClick={onCertificateSubmit}>Send certificates</Button>
      </Dialog>
    </>
  );
};
