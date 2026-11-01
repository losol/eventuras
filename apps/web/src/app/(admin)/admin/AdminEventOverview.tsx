'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatDate } from '@eventuras/core/datetime';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { ToggleButtonGroup } from '@eventuras/ratio-ui/core/ToggleButtonGroup';
import { SearchField } from '@eventuras/ratio-ui/forms/SearchField';
import { Link } from '@eventuras/ratio-ui-next/Link';

import type { EventDto } from '@/lib/eventuras-sdk';
import { activeRegistrations } from '@/utils/registration-helpers';

import {
  fillTone,
  inTab,
  matchesQuery,
  OVERVIEW_TABS,
  type OverviewRow,
  type OverviewTab,
  type Relative,
  sortRows,
  toOverviewRow,
} from './eventOverview';

import styles from './AdminEventOverview.module.css';

const FILL_COLOR = {
  primary: 'var(--color-primary-600)',
  accent: 'var(--color-accent-600)',
  warning: 'var(--color-warning-600)',
} as const;

type Props = {
  events: EventDto[];
  /** LocalDate, computed on the server so the client renders the same rows. */
  today: string;
};

/** Admin front page: searchable, tabbed overview of the organization's events. */
export function AdminEventOverview({ events, today }: Readonly<Props>) {
  const t = useTranslations('admin.eventOverview');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<OverviewTab>('upcoming');

  const all = useMemo(
    () => events.map(e => toOverviewRow(e, activeRegistrations(e.statistics), today)),
    [events, today]
  );
  const matches = all.filter(r => matchesQuery(r, query));
  const rows = sortRows(
    matches.filter(r => inTab(r, tab)),
    tab
  );

  const upcoming = all.filter(r => inTab(r, 'upcoming'));
  const registrations = upcoming.reduce((sum, r) => sum + r.registrations, 0);

  const relativeLabel = (relative?: Relative) =>
    relative
      ? t(`relative.${relative.kind}`, 'count' in relative ? { count: relative.count } : {})
      : '';

  return (
    <section className={styles.overview} data-testid="admin-event-overview">
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <Heading as="h1" padding="none" marginY="none">
            {t('title')}
          </Heading>
          <Text variant="subtle">{t('summary', { upcoming: upcoming.length, registrations })}</Text>
        </div>
        <Link href="/admin/events/create" variant="button-primary" testId="add-event-button">
          {t('create')}
        </Link>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        shortcut="mod+k"
        size="lg"
        labels={{ clear: t('clear') }}
      />

      <ToggleButtonGroup
        variant="chips"
        aria-label={t('tabsLabel')}
        disallowEmptySelection
        value={tab}
        onChange={value => value && setTab(value as OverviewTab)}
        options={OVERVIEW_TABS.map(id => ({
          value: id,
          label: t(`tabs.${id}`),
          count: matches.filter(r => inTab(r, id)).length,
        }))}
      />

      <div className={styles.table}>
        <div className={styles.head}>
          <span>{t('columns.title')}</span>
          <span>{t('columns.location')}</span>
          <span>{t('columns.when')}</span>
          <span>{t('columns.registrations')}</span>
          <span />
        </div>

        {rows.map(row => (
          <EventRow
            key={row.event.id}
            row={row}
            statusLabel={t(`status.${row.statusKey}`)}
            dateLabel={row.event.dateStart ? formatDate(row.event.dateStart, { locale }) : ''}
            relativeLabel={relativeLabel(row.relative)}
          />
        ))}

        {rows.length === 0 && (
          <div className={styles.empty}>
            <Text variant="muted">{query ? t('emptyQuery', { query }) : t('empty')}</Text>
            {query && tab !== 'all' && (
              <button type="button" onClick={() => setTab('all')} className={styles.linkButton}>
                {t('searchAll')}
              </button>
            )}
          </div>
        )}
      </div>

      <Link href="/admin/events" className={styles.showAll}>
        {t('showAll')} →
      </Link>
    </section>
  );
}

type EventRowProps = {
  row: OverviewRow;
  statusLabel: string;
  dateLabel: string;
  relativeLabel: string;
};

function EventRow({ row, statusLabel, dateLabel, relativeLabel }: Readonly<EventRowProps>) {
  const { event, registrations, capacity, fill } = row;
  const href = `/admin/events/${event.id}`;

  return (
    <div className={styles.row}>
      <div className={styles.titleCell}>
        <Link href={href} className={styles.titleLink}>
          {event.title}
        </Link>
        <Badge status={row.badge} variant="subtle">
          {statusLabel}
        </Badge>
      </div>
      <span className={styles.muted}>{event.location}</span>
      <div className={styles.stack}>
        <span>{dateLabel}</span>
        <span className={styles.subtle}>{relativeLabel}</span>
      </div>
      <div className={styles.stack}>
        <span>{capacity ? `${registrations} / ${capacity}` : registrations}</span>
        {fill !== undefined && (
          <div className={styles.bar}>
            <div
              className={styles.barFill}
              style={{
                width: `${Math.min(fill, 1) * 100}%`,
                background: FILL_COLOR[fillTone(fill)],
              }}
            />
          </div>
        )}
      </div>
      <svg
        aria-hidden="true"
        className={styles.chevron}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  );
}
