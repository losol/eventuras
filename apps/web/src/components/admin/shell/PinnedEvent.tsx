'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

export type PinnedEvent = {
  id: number;
  title: string;
  /** Stable identifier, used to fetch the event's activity. */
  uuid?: string;
  participantCount?: number;
};

type PinnedEventContextValue = {
  event: PinnedEvent | null;
  pin: (event: PinnedEvent) => void;
  unpin: () => void;
};

const PinnedEventContext = createContext<PinnedEventContextValue | null>(null);

// A tiny sessionStorage-backed store so the pinned event survives reloads
// and hydrates without a server/client mismatch.
const STORAGE_KEY = 'eventuras.admin.pinnedEvent';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable; the event page re-pins on its next visit.
  }
  listeners.forEach(listener => listener());
}

function parse(raw: string | null): PinnedEvent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PinnedEvent>;
    if (typeof parsed.id !== 'number' || typeof parsed.title !== 'string') return null;
    return {
      id: parsed.id,
      title: parsed.title,
      uuid: typeof parsed.uuid === 'string' ? parsed.uuid : undefined,
      participantCount:
        typeof parsed.participantCount === 'number' ? parsed.participantCount : undefined,
    };
  } catch {
    return null;
  }
}

const pin = (event: PinnedEvent) => write(JSON.stringify(event));
const unpin = () => write(null);

/**
 * The event the admin is currently working in. It stays in the sidebar when
 * they move to users, orders etc., so the sidebar never "forgets" the event.
 * Cleared with the sidebar's close button.
 */
export function PinnedEventProvider({ children }: Readonly<{ children: ReactNode }>) {
  const raw = useSyncExternalStore(subscribe, readSnapshot, () => null);
  const event = useMemo(() => parse(raw), [raw]);
  const value = useMemo(() => ({ event, pin, unpin }), [event]);

  return <PinnedEventContext.Provider value={value}>{children}</PinnedEventContext.Provider>;
}

export function usePinnedEvent(): PinnedEventContextValue {
  const ctx = useContext(PinnedEventContext);
  if (!ctx) throw new Error('usePinnedEvent must be used inside PinnedEventProvider');
  return ctx;
}

/** Rendered by the event admin page to pin that event in the sidebar. */
export function PinEvent({ event }: Readonly<{ event: PinnedEvent }>) {
  const { pin } = usePinnedEvent();
  const { id, title, uuid, participantCount } = event;
  useEffect(() => {
    pin({ id, title, uuid, participantCount });
  }, [pin, id, title, uuid, participantCount]);
  return null;
}
