import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Run } from '../types/run';

type RunState = { run: Run | null; setRun: (run: Run | null) => void };

const RunContext = createContext<RunState | null>(null);

/** Holds the run currently being turned into a card. In-memory only for v0.1. */
export function RunProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<Run | null>(null);
  const value = useMemo(() => ({ run, setRun }), [run]);
  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun(): RunState {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error('useRun must be used inside <RunProvider>');
  return ctx;
}
