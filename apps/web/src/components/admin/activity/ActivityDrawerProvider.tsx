'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type ActivityDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ActivityDrawerContext = createContext<ActivityDrawerContextValue | null>(null);

/** Open/closed state of the activity drawer, shared by the sidebar and the pages that open it. */
export function ActivityDrawerProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <ActivityDrawerContext.Provider value={value}>{children}</ActivityDrawerContext.Provider>;
}

export function useActivityDrawer(): ActivityDrawerContextValue {
  const ctx = useContext(ActivityDrawerContext);
  if (!ctx) throw new Error('useActivityDrawer must be used inside ActivityDrawerProvider');
  return ctx;
}
