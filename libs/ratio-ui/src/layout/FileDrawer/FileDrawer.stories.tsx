import { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../../core/Button';
import { FileDrawer } from './FileDrawer';

const meta: Meta<typeof FileDrawer> = {
  component: FileDrawer,
  parameters: {
    tags: ['autodocs'],
  },
};

export default meta;
type Story = StoryObj<typeof FileDrawer>;

const sampleHtml = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Georgia, serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
  .cert { border: 4px double #333; padding: 3rem; text-align: center; max-width: 600px; background: white; }
  h1 { font-size: 2rem; margin-bottom: 0.5rem; }
  .name { font-size: 1.5rem; color: #1a56db; margin: 1rem 0; }
</style></head>
<body>
  <div class="cert">
    <h1>Certificate of Completion</h1>
    <p>This is to certify that</p>
    <p class="name">Gerhard Henrik Armauer Hansen</p>
    <p>has successfully completed the course</p>
    <p><strong>Introduction to Storybook</strong></p>
    <p><em>March 2026</em></p>
  </div>
</body>
</html>`;

export const WithHtmlContent: Story = {
  args: {
    isOpen: true,
    title: 'Certificate Preview',
    content: sampleHtml,
    closeLabel: 'Close',
    onClose: () => {},
  },
};

export const WithDownload: Story = {
  args: {
    isOpen: true,
    title: 'Certificate Preview',
    content: sampleHtml,
    downloadFilename: 'certificate.html',
    downloadLabel: 'Download',
    closeLabel: 'Close',
    onClose: () => {},
  },
};

const InteractiveExample = () => {
  const [html, setHtml] = useState<string | null>(null);

  return (
    <div>
      <Button onClick={() => setHtml(sampleHtml)}>Preview Certificate</Button>
      <FileDrawer
        isOpen={!!html}
        onClose={() => setHtml(null)}
        title="Certificate Preview"
        content={html ?? undefined}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
