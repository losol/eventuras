import React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
  target?: string;
  isOpen: boolean;
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ isOpen, children, target }) => {
  if (!isOpen) return null;

  const portalRoot = target ? document.getElementById(target) : document.body;
  if (!portalRoot) return null;

  return ReactDOM.createPortal(children, portalRoot);
};

export default Portal;
