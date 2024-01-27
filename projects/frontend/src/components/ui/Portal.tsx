import React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
  target?: string;
  clickOutside?: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ isOpen, children, target, clickOutside }) => {
  if (!isOpen) return null;

  const portalRoot = target ? document.getElementById(target) : document.body;
  if (!portalRoot) return null;
  if (clickOutside) {
    portalRoot.addEventListener('mousedown', (event: any) => {
      if (event.target.id === 'backdrop') {
        clickOutside();
      }
    });
  }

  return ReactDOM.createPortal(children, portalRoot);
};

export default Portal;
