import React from 'react';
import { Panel } from '@eventuras/ratio-ui/core/Panel';
import type { Status } from '@eventuras/ratio-ui/tokens';

const DEFAULT_CONFIG = { status: 'info' as Status, icon: 'ℹ️', label: 'Note' };

const CALLOUT_MAP: Record<string, { status: Status; icon: string; label: string }> = {
  NOTE: DEFAULT_CONFIG,
  TIP: { status: 'success', icon: '💡', label: 'Tip' },
  IMPORTANT: { status: 'info', icon: '❗', label: 'Important' },
  WARNING: { status: 'warning', icon: '⚠️', label: 'Warning' },
  CAUTION: { status: 'error', icon: '🔴', label: 'Caution' },
};

/**
 * react-markdown component override for `callout` elements
 * produced by remarkCallout. Uses the ratio-ui Panel component.
 */
export const calloutComponents = {
  callout: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    'data-callout-type'?: string;
  }) => {
    const calloutType = props['data-callout-type'] ?? 'NOTE';
    const config = CALLOUT_MAP[calloutType] ?? DEFAULT_CONFIG;

    return (
      <Panel variant="callout" status={config.status}>
        <p className="font-semibold mb-1">
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </p>
        <div>{children}</div>
      </Panel>
    );
  },
};
