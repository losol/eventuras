import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useRef, useState } from 'react';
import { FileUpload, FileUploadItem } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible file picker with drag-and-drop, image previews and upload progress, built on react-aria-components DropZone + FileTrigger. Presentational: emits validated File[] via onSelect; the app owns the upload and feeds progress/status back through the controlled `items` list.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

let idSeq = 0;
const nextId = () => `file-${(idSeq += 1)}`;

/**
 * Controlled example that mimics how the consuming app drives the upload:
 * it appends selected files, then walks each one through fake progress to
 * success.
 */
const UploadExample = (props: Partial<React.ComponentProps<typeof FileUpload>>) => {
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Stop any in-flight fake uploads when the story unmounts (story switch / HMR).
  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of Object.values(active)) clearInterval(timer);
    };
  }, []);

  const fakeUpload = (id: string) => {
    timers.current[id] = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const progress = Math.min(100, (item.progress ?? 0) + 20);
          if (progress >= 100) {
            clearInterval(timers.current[id]);
            delete timers.current[id];
            return { ...item, progress: 100, status: 'success' };
          }
          return { ...item, progress, status: 'uploading' };
        })
      );
    }, 400);
  };

  const handleSelect = (files: File[]) => {
    const added = files.map<FileUploadItem>((file) => ({
      id: nextId(),
      file,
      progress: 0,
      status: 'uploading',
    }));
    setItems((prev) => [...prev, ...added]);
    added.forEach((item) => fakeUpload(item.id));
  };

  const handleRemove = (id: string) => {
    clearInterval(timers.current[id]);
    delete timers.current[id];
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <FileUpload
      items={items}
      onSelect={handleSelect}
      onRemove={handleRemove}
      {...props}
    />
  );
};

/** Single file, any type. */
export const Basic: Story = {
  render: () => <UploadExample label="Attachment" />,
};

/** Multiple image files with previews + size limit. */
export const Images: Story = {
  render: () => (
    <UploadExample
      label="Photos"
      accept={['image/*']}
      multiple
      maxSize={5 * 1024 * 1024}
      dropzoneLabel="Drag images here"
    />
  ),
};

/** Folder picking — the browse button selects a whole directory. */
export const Folder: Story = {
  render: () => (
    <UploadExample
      label="Import folder"
      acceptDirectory
      dropzoneLabel="Pick a folder to upload"
      buttonLabel="Choose folder"
    />
  ),
};

/** Static error state (validation / failed upload). */
export const ErrorState: Story = {
  render: () => (
    <FileUpload
      label="Documents"
      accept={['.pdf']}
      onSelect={() => {}}
      onRemove={() => {}}
      items={[
        {
          id: 'a',
          file: new File(['x'], 'contract.pdf', { type: 'application/pdf' }),
          status: 'error',
          error: 'Upload failed — try again',
        },
      ]}
    />
  ),
};

/** Disabled. */
export const Disabled: Story = {
  render: () => <UploadExample label="Attachment" isDisabled />,
};
