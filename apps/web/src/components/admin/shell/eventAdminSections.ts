/**
 * The event admin page is one route, `/admin/events/[id]?tab=…`. The sidebar
 * groups those tabs into sections; `edit` spans the five editor tabs, which
 * stay as a tab strip inside the section.
 */
export const EVENT_EDIT_TABS = [
  'overview',
  'dates',
  'descriptions',
  'certificate',
  'advanced',
] as const;

export type EventEditTab = (typeof EVENT_EDIT_TABS)[number];

export type EventAdminTab =
  EventEditTab | 'participants' | 'communication' | 'products' | 'economy' | 'export';

export type EventAdminSectionKey =
  'participants' | 'communication' | 'products' | 'economy' | 'edit' | 'export';

export type EventAdminSection = {
  key: EventAdminSectionKey;
  /** The tab the sidebar links to. */
  tab: EventAdminTab;
};

export const EVENT_ADMIN_SECTIONS: readonly EventAdminSection[] = [
  { key: 'participants', tab: 'participants' },
  { key: 'communication', tab: 'communication' },
  { key: 'products', tab: 'products' },
  { key: 'economy', tab: 'economy' },
  { key: 'edit', tab: 'overview' },
  { key: 'export', tab: 'export' },
];

export const DEFAULT_EVENT_ADMIN_TAB: EventAdminTab = 'participants';

export function isEventEditTab(tab: string): tab is EventEditTab {
  return (EVENT_EDIT_TABS as readonly string[]).includes(tab);
}

export function isEventAdminTab(tab: string | null | undefined): tab is EventAdminTab {
  return !!tab && (isEventEditTab(tab) || EVENT_ADMIN_SECTIONS.some(s => s.tab === tab));
}

/** Section a tab belongs to — the editor tabs all resolve to `edit`. */
export function sectionForTab(tab: EventAdminTab): EventAdminSection {
  if (isEventEditTab(tab)) return EVENT_ADMIN_SECTIONS.find(s => s.key === 'edit')!;
  return EVENT_ADMIN_SECTIONS.find(s => s.tab === tab)!;
}

export function eventAdminHref(eventId: number, tab?: EventAdminTab): string {
  const base = `/admin/events/${eventId}`;
  return tab ? `${base}?tab=${tab}` : base;
}
