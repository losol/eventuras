import React from 'react';
import { Panel, type PanelIntent } from '@eventuras/ratio-ui/core/Panel';

const DEFAULT_CONFIG = { intent: 'info' as PanelIntent, icon: 'ℹ️', label: 'Note' };

const CALLOUT_MAP: Record<string, { intent: PanelIntent; icon: string; label: string }> = {
  NOTE: DEFAULT_CONFIG,
  TIP: { intent: 'success', icon: '💡', label: 'Tip' },
  IMPORTANT: { intent: 'info', icon: '❗', label: 'Important' },
  WARNING: { intent: 'warning', icon: '⚠️', label: 'Warning' },
  CAUTION: { intent: 'error', icon: '🔴', label: 'Caution' },
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
      <Panel variant="callout" intent={config.intent}>
        <p className="font-semibold mb-1">
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </p>
        <div>{children}</div>
      </Panel>
    );
  },
};
