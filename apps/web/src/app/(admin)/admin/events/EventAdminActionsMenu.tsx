'use client';

import type { EventDto } from '@/lib/eventuras-sdk';

import { ExcelExportButton } from './[id]/ExcelExportButton';

export interface EventAdminActionsMenuProps {
  eventinfo: EventDto;
}

const EventAdminActionsMenu: React.FC<EventAdminActionsMenuProps> = ({ eventinfo }) => {
  return <ExcelExportButton EventinfoId={eventinfo.id!} />;
};

export default EventAdminActionsMenu;
