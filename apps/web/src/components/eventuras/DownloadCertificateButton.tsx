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
  const [loading, setLoading] = useState(false);
  const t = useTranslations();
  const toast = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await downloadCertificatePdf(certificateId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      // Convert base64 to blob and open in new window
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await sendCertificateToParticipant(registrationId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(t('admin.certificates.labels.sent'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitButton
      onClick={handleDownload}
      loading={loading}
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

// Keep the simple button for backwards compatibility
export interface DownloadCertificateButtonProps {
  certificateId: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export { CertificateActionsButton as default };
