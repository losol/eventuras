'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { SplitButton } from '@eventuras/ratio-ui/core/SplitButton';
import { Download, Send } from '@eventuras/ratio-ui/icons';
import { useToast } from '@eventuras/toast';

import {
  downloadCertificatePdf,
  sendCertificateToParticipant,
} from '@/app/(admin)/admin/certificates/certificateActions';

export interface CertificateActionsButtonProps {
  certificateId: number;
  registrationId: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CertificateActionsButton = ({
  certificateId,
  registrationId,
  size = 'md',
}: CertificateActionsButtonProps) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const t = useTranslations();
  const toast = useToast();

  const isLoading = downloadLoading || sendLoading;

  const handleDownload = async () => {
    if (isLoading) return;
    setDownloadLoading(true);
    try {
      const result = await downloadCertificatePdf(certificateId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      // Convert base64 to blob and open in new window
      const byteCharacters = atob(result.data);
      const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL);
      // Revoke the object URL after a short delay to free up memory
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSend = async () => {
    if (isLoading) return;
    setSendLoading(true);
    try {
      const result = await sendCertificateToParticipant(registrationId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(t('admin.certificates.labels.sent'));
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <SplitButton
      onClick={handleDownload}
      loading={isLoading}
      size={size}
      variant="outline"
      icon={<Download className="w-4 h-4" />}
      actions={[
        {
          id: 'send',
          label: t('admin.certificates.labels.send'),
          onClick: handleSend,
          icon: <Send className="w-4 h-4" />,
        },
      ]}
    >
      {t('admin.certificates.labels.download')}
    </SplitButton>
  );
};

export { CertificateActionsButton as default };
