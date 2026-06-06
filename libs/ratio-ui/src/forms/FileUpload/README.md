# FileUpload

> **Status: beta.** The API may still change in a minor release while it stabilises.

Accessible file picker with drag-and-drop, image previews and upload progress,
built on [`react-aria-components`](https://react-spectrum.adobe.com/react-aria/)
`DropZone` + `FileTrigger`.

The component is **presentational and transport-agnostic**. It emits validated
`File[]` through `onSelect` and renders the controlled `items` list. The
consuming app owns the actual upload (e.g. a server action / `FormData`) and
feeds `progress`/`status`/`error` back per item.

## Usage

```tsx
'use client';
import { FileUpload, type FileUploadItem } from '@eventuras/ratio-ui/forms';
import { useState } from 'react';

function AttachmentField() {
  const [items, setItems] = useState<FileUploadItem[]>([]);

  const onSelect = (files: File[]) => {
    const added = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'uploading' as const,
      progress: 0,
    }));
    setItems((prev) => [...prev, ...added]);
    added.forEach(upload); // your upload, updating items by id
  };

  return (
    <FileUpload
      items={items}
      accept={['image/*', '.pdf']}
      multiple
      maxSize={5 * 1024 * 1024}
      onSelect={onSelect}
      onRemove={(id) => setItems((p) => p.filter((i) => i.id !== id))}
      onError={(rejections) => console.warn(rejections)}
    />
  );
}
```

> `FileUpload` ships **without** a `'use client'` directive — ratio-ui leaves the
> client/server boundary to the consumer. It uses client-side state and browser
> APIs, so in the Next.js App Router render it within a Client Component (a module
> carrying the `'use client'` directive), as shown above.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `FileUploadItem[]` | Controlled file list. The app owns this together with the upload. |
| `onSelect` | `(files: File[]) => void` | Newly added files, already validated against `accept`/`maxSize`. |
| `onRemove` | `(id: string) => void` | User removed an item. Omit to hide remove buttons. |
| `onError` | `(rejections: FileUploadRejection[]) => void` | Files rejected by validation (`type` / `size` / `count`). |
| `accept` | `string[]` | Accepted MIME types or extensions, e.g. `['image/*', '.pdf']`. |
| `multiple` | `boolean` | Allow more than one file. Default `false`. |
| `acceptDirectory` | `boolean` | Accept whole folders — via the browse button or by dropping a folder (traversed recursively). Implies `multiple`. |
| `maxSize` | `number` | Max bytes per file; larger files are rejected. |
| `isDisabled` | `boolean` | Disable the whole control. |
| `label` | `string` | Field label. |
| `description` | `string` | Helper text. Defaults to an `accept` / `maxSize` summary. |
| `dropzoneLabel` | `ReactNode` | Text inside the drop zone. |
| `buttonLabel` | `string` | Browse-button text. |

### `FileUploadItem`

```ts
interface FileUploadItem {
  id: string;
  file: File;
  progress?: number; // 0–100, shown while status is 'uploading'
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
```

## Accessibility

- Drag-and-drop and keyboard picking are handled by React Aria's `DropZone` and
  `FileTrigger`.
- Each in-progress item exposes a labelled `progressbar`.
- Remove buttons get an `aria-label` naming the file.
