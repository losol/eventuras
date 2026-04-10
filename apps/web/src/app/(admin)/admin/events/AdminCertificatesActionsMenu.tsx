'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Drawer } from '@eventuras/ratio-ui/layout/Drawer';
import { FileDrawer } from '@eventuras/ratio-ui/layout/FileDrawer';
import { useToast } from '@eventuras/toast';

import { EventDto } from '@/lib/eventuras-sdk';

import { issueCertificates, previewCertificate } from './actions';

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
  const [certificateDrawerOpen, setCertificateDrawerOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const t = useTranslations();
  const toast = useToast();

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
        return;
      }
      toast.success(result.message || 'Certificates sent successfully!');
      logger.info({ eventId: eventinfo.id }, 'Certificates issued successfully');
      onCertificatesSent?.();
      setCertificateDrawerOpen(false);
    } catch (error) {
      logger.error({ error }, 'Unexpected error sending certificates');
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPreview = async () => {
    if (!eventinfo.id) {
      toast.error('Invalid event');
      return;
    }

    setPreviewHtml(null);
    setIsPreviewing(true);
    logger.info({ eventId: eventinfo.id }, 'Starting certificate preview');
    try {
      const result = await previewCertificate(eventinfo.id);
      logger.info({ eventId: eventinfo.id, success: result.success }, 'Preview result received');

      if (!result.success) {
        logger.error({ eventId: eventinfo.id, error: result.error }, 'Preview failed');
        toast.error(result.error.message);
        return;
      }

      if (!result.data || result.data.length === 0) {
        logger.error({ eventId: eventinfo.id }, 'Preview returned empty HTML');
        toast.error('Certificate preview returned empty content');
        return;
      }

      logger.info({ eventId: eventinfo.id, htmlLength: result.data.length }, 'Showing preview');
      setPreviewHtml(result.data);
    } catch (error) {
      logger.error({ eventId: eventinfo.id, error }, 'Unexpected error during preview');
      toast.error('An unexpected error occurred');
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <>
      <Button onClick={onPreview} variant="secondary" loading={isPreviewing}>
        {t('admin.labels.previewCertificate')}
      </Button>
      <Button onClick={() => setCertificateDrawerOpen(!certificateDrawerOpen)} variant="secondary">
        {t('admin.labels.sendCertificates')}
      </Button>

      <FileDrawer
        isOpen={!!previewHtml}
        onCancel={() => setPreviewHtml(null)}
        title={t('admin.labels.previewCertificate')}
        content={previewHtml ?? undefined}
        downloadFilename={`certificate-${eventinfo.slug ?? eventinfo.id}-preview.html`}
        closeLabel={t('common.buttons.cancel')}
      />

      <Drawer isOpen={certificateDrawerOpen} onCancel={() => setCertificateDrawerOpen(false)}>
        <Drawer.Header>
          <Heading as="h2">Certificate details</Heading>
        </Drawer.Header>
        <Drawer.Body>
          <DescriptionList>
            <DescriptionList.Term>Certificate title:</DescriptionList.Term>
            <DescriptionList.Definition>{eventinfo.certificateTitle}</DescriptionList.Definition>
            <DescriptionList.Term>Certificate description:</DescriptionList.Term>
            <DescriptionList.Definition>
              {eventinfo.certificateDescription}
            </DescriptionList.Definition>
          </DescriptionList>
        </Drawer.Body>
        <Drawer.Footer>
          <Button onClick={onCertificateSubmit} loading={isSubmitting}>
            Send certificates
          </Button>
          <Button
            onClick={() => setCertificateDrawerOpen(false)}
            variant="secondary"
            disabled={isSubmitting}
          >
            {t('common.buttons.cancel')}
          </Button>
        </Drawer.Footer>
      </Drawer>
    </>
  );
};
