import React, { useEffect, useMemo, useRef } from 'react';
import { Button, DropZone, FileTrigger, Text } from 'react-aria-components';
import type { DropItem } from 'react-aria-components';
import { AlertCircle, Check, CloudUpload, File as FileIcon, LoaderCircle, X } from '../../icons';
import { cn } from '../../utils/cn';

export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileUploadItem {
  /** Stable id; the app generates and owns this. */
  id: string;
  file: File;
  /** Upload progress, 0–100. Shown as a bar while `status` is `uploading`. */
  progress?: number;
  status?: FileUploadStatus;
  /** Error message shown under the item when `status` is `error`. */
  error?: string;
}

export interface FileUploadRejection {
  file: File;
  reason: 'type' | 'size' | 'count';
}

export interface FileUploadProps {
  /**
   * Tracked files (controlled). The app owns this list along with the actual
   * upload + progress; the component only renders and emits selection events.
   */
  items?: FileUploadItem[];
  /** Newly added files, already validated against `accept`/`maxSize`/`multiple`. */
  onSelect: (files: File[]) => void;
  /** Fired when the user removes an item via its remove button. */
  onRemove?: (id: string) => void;
  /** Files rejected by client-side validation. */
  onError?: (rejections: FileUploadRejection[]) => void;
  /** Accepted MIME types or extensions, e.g. `['image/*', '.pdf']`. */
  accept?: string[];
  /** Allow selecting more than one file. Default: false. */
  multiple?: boolean;
  /**
   * Accept whole directories — both via the browse button and by dropping a
   * folder, which is traversed recursively. All contained files are returned
   * (still filtered by `accept`). Implies `multiple`.
   */
  acceptDirectory?: boolean;
  /** Max size per file, in bytes. Larger files are rejected. */
  maxSize?: number;
  isDisabled?: boolean;
  label?: string;
  description?: string;
  /** Primary text inside the drop zone. */
  dropzoneLabel?: React.ReactNode;
  buttonLabel?: string;
  className?: string;
  testId?: string;
}

const styles = {
  wrapper: 'flex flex-col gap-2 w-full',
  label: 'text-sm font-medium text-(--text) cursor-default',
  description: 'text-xs text-(--text-muted)',
  dropzone: {
    base: [
      'flex flex-col items-center justify-center gap-2',
      'w-full px-4 py-8 rounded-lg text-center',
      'border-2 border-dashed border-border-1',
      'bg-card text-(--text-subtle)',
      'transition-colors',
      'data-[hovered]:border-(--primary)',
      'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--focus-ring)',
    ].join(' '),
    active: 'border-(--primary) bg-card-hover text-(--text)',
    disabled: 'opacity-50 cursor-not-allowed',
    icon: 'h-8 w-8',
  },
  button: [
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
    'border border-border-1 bg-card text-(--text) text-sm font-medium',
    'hover:border-(--primary)',
    'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-(--focus-ring)',
    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    'transition-colors',
  ].join(' '),
  list: 'flex flex-col gap-2',
  item: {
    base: 'flex items-center gap-3 p-2 rounded-lg border border-border-1 bg-card',
    thumb: 'h-10 w-10 shrink-0 rounded object-cover bg-card-hover',
    icon: 'h-10 w-10 shrink-0 rounded bg-card-hover p-2 text-(--text-subtle)',
    body: 'min-w-0 flex-1',
    name: 'truncate text-sm text-(--text)',
    meta: 'text-xs text-(--text-muted)',
    error: 'text-xs text-error-text',
    remove: [
      'shrink-0 rounded p-1 text-(--text-subtle)',
      'hover:text-(--text) hover:bg-card-hover',
      'focus:outline-none focus:ring-2 focus:ring-(--focus-ring)',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),
  },
  progress: {
    track: 'mt-1 h-1 w-full overflow-hidden rounded-full bg-card-hover',
    bar: 'h-full rounded-full bg-(--primary) transition-[width] duration-200',
  },
};

const isImage = (file: File) => file.type.startsWith('image/');

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
};

const matchesAccept = (file: File, accept?: string[]): boolean => {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type;
  return accept.some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith('.')) return name.endsWith(r);
    if (r.endsWith('/*')) return type.startsWith(r.slice(0, -1));
    return type === r;
  });
};

/**
 * Thumbnail that owns its object URL: created on mount, revoked on unmount.
 * Falls back to a generic file icon for non-image files.
 */
const FilePreview: React.FC<{ file: File; thumbClassName: string; iconClassName: string }> = ({
  file,
  thumbClassName,
  iconClassName,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  // Set the source imperatively so the object URL lives entirely inside the
  // effect lifecycle (created here, revoked on cleanup) — no render-time state.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !isImage(file)) return;
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (isImage(file)) {
    return <img ref={imgRef} alt={file.name} className={thumbClassName} />;
  }
  return <FileIcon className={iconClassName} aria-hidden="true" />;
};

/**
 * Flatten dropped items into a `File[]`, recursing into directories when
 * `includeDirectories` is set. Works for both the sync `e.items` array and the
 * async iterable returned by `DirectoryDropItem.getEntries()`.
 */
const collectDroppedFiles = async (
  items: Iterable<DropItem> | AsyncIterable<DropItem>,
  includeDirectories: boolean
): Promise<File[]> => {
  const files: File[] = [];
  for await (const item of items) {
    if (item.kind === 'file') {
      files.push(await item.getFile());
    } else if (item.kind === 'directory' && includeDirectories) {
      files.push(...(await collectDroppedFiles(item.getEntries(), true)));
    }
  }
  return files;
};

const StatusIcon: React.FC<{ status?: FileUploadStatus }> = ({ status }) => {
  if (status === 'uploading') {
    return <LoaderCircle className="h-4 w-4 animate-spin text-(--primary)" aria-hidden="true" />;
  }
  if (status === 'success') {
    return <Check className="h-4 w-4 text-success-text" aria-hidden="true" />;
  }
  if (status === 'error') {
    return <AlertCircle className="h-4 w-4 text-error-text" aria-hidden="true" />;
  }
  return null;
};

/**
 * FileUpload — accessible file picker with drag-and-drop, image previews and
 * upload progress, built on react-aria-components' `DropZone` + `FileTrigger`.
 *
 * Presentational and transport-agnostic: it emits validated `File[]` via
 * `onSelect` and renders the controlled `items` list. The consuming app owns
 * the actual upload and feeds back `progress`/`status`/`error` per item.
 *
 * @beta The API may change in a minor release while it stabilises.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   items={items}
 *   accept={['image/*']}
 *   multiple
 *   maxSize={5 * 1024 * 1024}
 *   onSelect={(files) => uploadAll(files)}
 *   onRemove={(id) => cancel(id)}
 * />
 * ```
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  items = [],
  onSelect,
  onRemove,
  onError,
  accept,
  multiple = false,
  acceptDirectory = false,
  maxSize,
  isDisabled,
  label,
  description,
  dropzoneLabel = 'Drag files here',
  buttonLabel = 'Browse files',
  className,
  testId,
}) => {
  const acceptHint = useMemo(() => accept?.join(', '), [accept]);

  const allowsMany = multiple || acceptDirectory;

  const processFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const candidates = allowsMany ? incoming : incoming.slice(0, 1);
    const accepted: File[] = [];
    const rejections: FileUploadRejection[] = [];

    // Surface (rather than silently drop) extras when only one file is allowed.
    if (!allowsMany) {
      for (const file of incoming.slice(1)) rejections.push({ file, reason: 'count' });
    }

    for (const file of candidates) {
      if (!matchesAccept(file, accept)) {
        rejections.push({ file, reason: 'type' });
      } else if (maxSize != null && file.size > maxSize) {
        rejections.push({ file, reason: 'size' });
      } else {
        accepted.push(file);
      }
    }

    if (rejections.length > 0) onError?.(rejections);
    if (accepted.length > 0) onSelect(accepted);
  };

  return (
    <div className={cn(styles.wrapper, className)} data-testid={testId}>
      {label && <span className={styles.label}>{label}</span>}

      <DropZone
        isDisabled={isDisabled}
        aria-label={label ?? 'File upload drop zone'}
        className={({ isDropTarget }) =>
          cn(
            styles.dropzone.base,
            isDropTarget && styles.dropzone.active,
            isDisabled && styles.dropzone.disabled
          )
        }
        onDrop={async (e) => {
          processFiles(await collectDroppedFiles(e.items, acceptDirectory));
        }}
      >
        <CloudUpload className={styles.dropzone.icon} aria-hidden="true" />
        <Text slot="label" className="text-sm">
          {dropzoneLabel}
        </Text>
        <FileTrigger
          acceptedFileTypes={accept}
          allowsMultiple={allowsMany}
          acceptDirectory={acceptDirectory}
          onSelect={(fileList) => {
            if (fileList) processFiles(Array.from(fileList));
          }}
        >
          <Button className={styles.button} isDisabled={isDisabled}>
            <CloudUpload className="h-4 w-4" aria-hidden="true" />
            {buttonLabel}
          </Button>
        </FileTrigger>
      </DropZone>

      {(description || acceptHint || maxSize != null) && (
        <span className={styles.description}>
          {description ??
            [acceptHint, maxSize != null ? `up to ${formatBytes(maxSize)}` : null]
              .filter(Boolean)
              .join(' · ')}
        </span>
      )}

      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item.base}>
              <FilePreview
                file={item.file}
                thumbClassName={styles.item.thumb}
                iconClassName={styles.item.icon}
              />

              <div className={styles.item.body}>
                <div className="flex items-center gap-2">
                  <span className={styles.item.name}>{item.file.name}</span>
                  <StatusIcon status={item.status} />
                </div>
                <span className={styles.item.meta}>{formatBytes(item.file.size)}</span>

                {item.status === 'uploading' && (
                  <div
                    className={styles.progress.track}
                    role="progressbar"
                    aria-label={`Uploading ${item.file.name}`}
                    aria-valuenow={item.progress ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={styles.progress.bar}
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                )}

                {item.status === 'error' && item.error && (
                  <span className={styles.item.error}>{item.error}</span>
                )}
              </div>

              {onRemove && (
                <button
                  type="button"
                  className={styles.item.remove}
                  onClick={() => onRemove(item.id)}
                  disabled={isDisabled}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

FileUpload.displayName = 'FileUpload';
