'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Definition, DescriptionList, Term } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { useToast } from '@eventuras/toast';

import { EventDto } from "@/lib/eventuras-sdk";

import { issueCertificates } from './actions';
const logger = Logger.create({
  namespace: 'web:admin:certificates',
  context: { component: 'AdminCertificatesActionsMenu' },
});
type AdminCertificatesActionsMenuProps = {
  eventinfo: EventDto;
  onCertificatesSent?: () => void;
};
export const AdminCertificatesActionsMenu: React.FC<AdminCertificatesActionsMenuProps> = ({
  eventinfo,
  onCertificatesSent,
}) => {
  const [certificateDrawerOpen, setCertificateDrawerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const t = useTranslations();
  const toast = useToast();
  const onClose = () => {
    setCertificateDrawerOpen(false);
  };
  const onCertificateSubmit = async () => {
    if (!eventinfo.id) {
      logger.error('Event ID is missing');
      toast.error('Invalid event');
      return;
    }
    setIsSubmitting(true);
    logger.info({ eventId: eventinfo.id }, 'Sending certificates...');
    try {
      const result = await issueCertificates(eventinfo.id);
      if (!result.success) {
        logger.error({ error: result.error }, 'Failed to issue certificates');
        toast.error(result.error.message);
        setIsSubmitting(false);
        return;
      }
      toast.success(result.message || 'Certificates sent successfully!');
      logger.info({ eventId: eventinfo.id }, 'Certificates issued successfully');
      if (onCertificatesSent) {
        onCertificatesSent();
      }
      onClose();
    } catch (error) {
      logger.error({ error }, 'Unexpected error sending certificates');
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
          <Button onClick={onCertificateSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send certificates'}
          </Button>
          <Button onClick={() => onClose()} variant="secondary" disabled={isSubmitting}>
            Close
          </Button>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
