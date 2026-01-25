import React from 'react';

import RichText from '@/components/RichText';
import type { ResourcesBlock as ResourcesBlockType } from '@/payload-types';

type ResourceItem = NonNullable<ResourcesBlockType['items']>[number];

export const ResourcesBlock: React.FC<ResourcesBlockType> = ({
  title,
  type,
  description,
  items,
}) => {
  return (
    <div className={`resources-block resources-block--${type}`}>
      <h3>{title}</h3>
      {description && <RichText data={description} />}
      <ul className="resources-list">
        {items?.map((item: ResourceItem, index: number) => (
          <li key={index} className="resource-item">
            <strong>{item.name}</strong>
            {item.quantity && <span className="quantity"> — {item.quantity}</span>}
            {item.unit && <span className="unit"> {item.unit}</span>}
            {item.description && (
              <div className="resource-description">
                <RichText data={item.description} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
