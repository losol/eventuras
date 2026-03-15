import React from 'react';
import { Schedule, ScheduleItem } from '@eventuras/ratio-ui/core/Schedule';

/**
 * react-markdown component overrides that render `schedule-list` and
 * `schedule-item` elements (produced by remarkSchedule) as Schedule components.
 */
export const scheduleComponents = {
  'schedule-list': ({ children }: { children?: React.ReactNode }) => (
    <Schedule>{children}</Schedule>
  ),
  'schedule-item': (props: Record<string, string>) => (
    <ScheduleItem
      time={props['data-time'] ?? ''}
      title={props['data-title'] ?? ''}
      speaker={props['data-speaker'] || undefined}
      description={props['data-description'] || undefined}
    />
  ),
};
