import { useCallback, useEffect, useMemo } from 'react';

import { Button } from '../../core/Button';
import { Drawer } from '../Drawer/Drawer';

export interface FileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Raw file content (HTML string, SVG, etc.) */
  content?: string;
  /** MIME type for the content (default: text/html) */
  contentType?: string;
  /** Direct URL to display (takes precedence over content) */
  src?: string;
  /** If set, shows a download button with this filename */
  downloadFilename?: string;
  /** Label for the download button */
  downloadLabel?: string;
  /** Label for the close button */
  closeLabel?: string;
}

/**
 * Drawer that displays file content in an embedded iframe.
 * Accepts either a `src` URL or raw `content` (which is converted to a blob URL internally).
 * Optionally shows a download button when `downloadFilename` is provided.
 */
export const FileDrawer = ({
  isOpen,
  onClose,
  title,
  content,
  contentType = 'text/html',
  src,
  downloadFilename,
  downloadLabel = 'Download',
  closeLabel = 'Close',
}: FileDrawerProps) => {
  const blobUrl = useMemo(() => {
    if (!isOpen || src || !content) return null;
    return URL.createObjectURL(new Blob([content], { type: contentType }));
  }, [isOpen, content, contentType, src]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const iframeSrc = src ?? blobUrl;

  const handleDownload = useCallback(() => {
    if (!iframeSrc) return;
    const a = document.createElement('a');
    a.href = iframeSrc;
    a.download = downloadFilename ?? 'download';
    a.click();
  }, [iframeSrc, downloadFilename]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header>
        <Drawer.Heading>{title}</Drawer.Heading>
      </Drawer.Header>
      <Drawer.Body className="flex flex-col">
        {iframeSrc && (
          <iframe
            src={iframeSrc}
            sandbox="allow-same-origin"
            className="w-full flex-1 rounded border border-border bg-white"
            title={title}
          />
        )}
      </Drawer.Body>
      <Drawer.Footer>
        {downloadFilename && iframeSrc && (
          <Button onClick={handleDownload} variant="primary">
            {downloadLabel}
          </Button>
        )}
        <Button onClick={onClose} variant="secondary">
          {closeLabel}
        </Button>
      </Drawer.Footer>
    </Drawer>
  );
};
