import type * as React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Console, type ConsoleLevel } from './Console';

const meta: Meta<typeof Console> = {
  title: 'Console/Stream',
  component: Console,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Themable terminal-style log / event console. Purely presentational — the consumer owns data, expansion, pause/play, filtering, and scroll. Use for streaming logs, business-event feeds, audit trails, liveblogs.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Console>;

/* ── Sample data shared across stories ─────────────────────── */

interface SampleEntry {
  id: string;
  hh: string;
  mm: string;
  ss: string;
  ms: string;
  level: ConsoleLevel;
  source: string;
  sourceColor: string;
  message: React.ReactNode;
  meta: string;
  payload: Record<string, unknown>;
}

const SOURCE_COLORS = {
  Realtime: 'oklch(0.55 0.13 280)',
  HTTP: 'oklch(0.45 0.15 226)',
  Audit: 'oklch(0.52 0.10 78)',
  Job: 'oklch(0.55 0.10 200)',
  Email: 'oklch(0.52 0.12 320)',
  Payment: 'oklch(0.50 0.10 145)',
  Health: 'oklch(0.55 0 0)',
  Enrollment: 'oklch(0.52 0.13 28)',
} as const;

const SAMPLE: SampleEntry[] = [
  {
    id: 'e1', hh: '18', mm: '42', ss: '11', ms: '234',
    level: 'info', source: 'Realtime', sourceColor: SOURCE_COLORS.Realtime,
    message: (<>Client connected: <b>leo@losen.com</b> · connection <code>conn_7g3hx</code></>),
    meta: '12 active',
    payload: { user: 'leo@losen.com', connectionId: 'conn_7g3hx', transport: 'WebSockets', activeConnections: 12 },
  },
  {
    id: 'e2', hh: '18', mm: '42', ss: '35', ms: '012',
    level: 'debug', source: 'HTTP', sourceColor: SOURCE_COLORS.HTTP,
    message: (<><code>GET</code> /api/articles?status=published → <b>200 OK</b></>),
    meta: '38 ms',
    payload: { method: 'GET', path: '/api/articles', status: 200, durationMs: 38, requestId: 'req_91kf2' },
  },
  {
    id: 'e3', hh: '18', mm: '42', ss: '58', ms: '441',
    level: 'info', source: 'Enrollment', sourceColor: SOURCE_COLORS.Enrollment,
    message: (<>New enrollment: <b>Workshop: System design</b> · 18 / 30 seats</>),
    meta: 'Leo Losen',
    payload: { workshopId: 'wsh_42', attendee: { name: 'Leo Losen', id: 'usr_881' }, seatsTaken: 18, seatsTotal: 30 },
  },
  {
    id: 'e4', hh: '18', mm: '43', ss: '02', ms: '108',
    level: 'success', source: 'Payment', sourceColor: SOURCE_COLORS.Payment,
    message: (<>Payment captured: <code>ord_7K2J</code> · 49 EUR · card</>),
    meta: '✓ captured',
    payload: { orderId: 'ord_7K2J', amount: 49, currency: 'EUR', provider: 'card', status: 'captured' },
  },
  {
    id: 'e5', hh: '18', mm: '43', ss: '19', ms: '772',
    level: 'warning', source: 'HTTP', sourceColor: SOURCE_COLORS.HTTP,
    message: (<><code>POST</code> /api/payments/charge → <b>429 Too Many Requests</b></>),
    meta: 'retry 1/3',
    payload: { method: 'POST', path: '/api/payments/charge', status: 429, retry: 1, maxRetries: 3 },
  },
  {
    id: 'e6', hh: '18', mm: '43', ss: '41', ms: '015',
    level: 'error', source: 'Job', sourceColor: SOURCE_COLORS.Job,
    message: (<>SMTP timeout after 30 s · queue: <b>3</b> pending emails</>),
    meta: 'mail-out',
    payload: { error: 'ETIMEDOUT', host: 'mail-relay-01', queueRemaining: 3, willRetry: true },
  },
  {
    id: 'e7', hh: '18', mm: '43', ss: '52', ms: '230',
    level: 'info', source: 'Audit', sourceColor: SOURCE_COLORS.Audit,
    message: (<><b>Leo Losen</b> updated workshop price: <code>wsh_19</code> · 39 → 49 EUR</>),
    meta: 'settings',
    payload: { actor: 'Leo Losen', action: 'workshop.price.update', before: 39, after: 49 },
  },
];

function groupByMinute(entries: SampleEntry[]) {
  const groups = new Map<string, SampleEntry[]>();
  for (const e of entries) {
    const key = `${e.hh}:${e.mm}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return [...groups.entries()];
}

function renderJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/* ── Helper component used by stories ──────────────────────── */

interface FullConsoleProps {
  theme: 'light' | 'dark' | 'retro';
  envTag?: string;
  paused?: boolean;
  title?: React.ReactNode;
}

const FullConsole: React.FC<FullConsoleProps> = ({
  theme,
  envTag = 'prod',
  paused = false,
  title,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('e4');
  const groups = groupByMinute(SAMPLE);

  return (
    <Console theme={theme} aria-label="System log" className="h-[640px]">
      <Console.TitleBar>
        <Console.Title>
          {title ?? (
            <>
              System log <Console.Tag>{envTag}</Console.Tag>
            </>
          )}
        </Console.Title>
        <Console.LiveIndicator status={paused ? 'paused' : 'live'}>
          {paused ? 'Paused' : 'Live'}
        </Console.LiveIndicator>
        <Console.Counter>
          <b>{SAMPLE.length}</b> events · last 10 min
        </Console.Counter>
      </Console.TitleBar>
      <Console.Body>
        {groups.map(([label, items]) => (
          <div key={label}>
            <Console.Group label={label} count={items.length} />
            {items.map((ev) => (
              <Console.Entry
                key={ev.id}
                timestamp={<Console.Time hhmmss={`${ev.hh}:${ev.mm}:${ev.ss}`} ms={ev.ms} />}
                level={ev.level}
                source={ev.source}
                sourceColor={ev.sourceColor}
                message={ev.message}
                meta={ev.meta}
                expanded={expandedId === ev.id}
                onToggle={(next) => setExpandedId(next ? ev.id : null)}
              >
                <Console.EntryDetail>{renderJson(ev.payload)}</Console.EntryDetail>
              </Console.Entry>
            ))}
          </div>
        ))}
      </Console.Body>
    </Console>
  );
};

/* ── Stories ───────────────────────────────────────────────── */

const LIGHT_FRAME = 'h-[700px] p-6 bg-secondary-200';
const DARK_FRAME = 'h-[700px] p-6 bg-[oklch(0.14_0.02_234)]';
const RETRO_FRAME =
  'h-[700px] p-6 bg-[radial-gradient(ellipse_at_center,_#0d130c_0%,_#050803_100%)]';

export const Light: Story = {
  name: 'Theme — Light',
  render: () => (
    <div className={LIGHT_FRAME}>
      <FullConsole theme="light" />
    </div>
  ),
};

export const Dark: Story = {
  name: 'Theme — Dark',
  render: () => (
    <div className={DARK_FRAME}>
      <FullConsole theme="dark" />
    </div>
  ),
};

export const Retro: Story = {
  name: 'Theme — Retro CRT',
  render: () => (
    <div className={RETRO_FRAME}>
      <FullConsole theme="retro" title="platform.sys // console" envTag="prod" />
    </div>
  ),
};

export const Paused: Story = {
  name: 'State — Paused',
  render: () => (
    <div className={LIGHT_FRAME}>
      <FullConsole theme="light" paused />
    </div>
  ),
};

export const Compact720: Story = {
  name: 'Responsive — 720px (drops source column)',
  render: () => (
    <div className={`w-[720px] ${LIGHT_FRAME}`}>
      <FullConsole theme="light" />
    </div>
  ),
};

export const Compact440: Story = {
  name: 'Responsive — 440px (two-line rows)',
  render: () => (
    <div className="w-[440px] h-[700px] p-4 bg-secondary-200">
      <FullConsole theme="light" />
    </div>
  ),
};

/* ── Minimal example for docs ──────────────────────────────── */

export const MinimalApi: Story = {
  name: 'Minimal API',
  render: () => (
    <div className="h-[400px] p-6 bg-secondary-200">
      <Console theme="light" aria-label="Activity">
        <Console.TitleBar>
          <Console.Title>Activity</Console.Title>
          <Console.LiveIndicator>Live</Console.LiveIndicator>
        </Console.TitleBar>
        <Console.Body>
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:00:00" />}
            level="info"
            message="Service started"
          />
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:00:42" />}
            level="warning"
            message="Cache miss for key user_881"
            meta="lookup"
          />
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:01:15" />}
            level="error"
            message="Failed to send confirmation email"
            meta="3 retries"
          />
        </Console.Body>
      </Console>
    </div>
  ),
};

/* ── Liveblog variant — same primitives, no console chrome ─── */

export const Liveblog: Story = {
  name: 'Use case — Liveblog',
  parameters: {
    docs: {
      description: {
        story:
          'Same primitives can drive a non-technical liveblog: severity becomes a content type (update / heads-up / decision), and the message slot carries prose. No expansion.',
      },
    },
  },
  render: () => (
    <div className="h-[600px] p-6 bg-secondary-200">
      <Console theme="light" aria-label="Liveblog">
        <Console.TitleBar>
          <Console.Title>Conference liveblog</Console.Title>
          <Console.LiveIndicator>Live</Console.LiveIndicator>
        </Console.TitleBar>
        <Console.Body>
          <Console.Group label="10:00" />
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:02" />}
            level="info"
            levelLabel="update"
            message="Doors open. Coffee in the foyer."
          />
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:14" />}
            level="warning"
            levelLabel="heads-up"
            message="Track 2 has moved to room 204."
          />
          <Console.Entry
            timestamp={<Console.Time hhmmss="10:31" />}
            level="success"
            levelLabel="decision"
            message="Closing keynote confirmed for 16:30."
          />
        </Console.Body>
      </Console>
    </div>
  ),
};
