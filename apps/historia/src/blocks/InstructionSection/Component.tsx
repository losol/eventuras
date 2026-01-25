import React from 'react';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import RichText from '@/components/RichText';
import type { InstructionSectionBlock as InstructionSectionBlockProps } from '@/payload-types';

export const InstructionSectionBlock: React.FC<InstructionSectionBlockProps> = ({
  title,
  description,
  sectionContent,
}) => {
  return (
    <section className="instruction-section">
      <h2 className="section-title">{title}</h2>
      {description && (
        <div className="section-description">
          <RichText data={description} />
        </div>
      )}
      {sectionContent && sectionContent.length > 0 && (
        <div className="section-content">
          <RenderBlocks blocks={sectionContent} />
        </div>
      )}
    </section>
  );
};
