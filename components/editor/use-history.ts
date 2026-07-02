"use client";

import { useCallback, useRef, useState } from "react";
import type { EmailDocument } from "@/lib/blocks/schema";

// Milliseconds within which successive coalescable updates (typing) are
// merged into a single undo step.
const COALESCE_MS = 800;

type HistoryState = {
  past: EmailDocument[];
  present: EmailDocument;
  future: EmailDocument[];
};

// Undo/redo state for the editor document. Text typing is coalesced so a
// burst of keystrokes undoes as one step, like in mature editors.
export function useDocHistory(initial: EmailDocument) {
  const [state, setState] = useState<HistoryState>({
    past: [],
    present: initial,
    future: [],
  });
  const lastPushAt = useRef(0);

  const update = useCallback((next: EmailDocument, opts?: { coalesce?: boolean }) => {
    const now = Date.now();
    setState((s) => {
      const coalesce = Boolean(opts?.coalesce) && now - lastPushAt.current < COALESCE_MS;
      lastPushAt.current = now;
      return {
        past: coalesce ? s.past : [...s.past.slice(-49), s.present],
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    });
    lastPushAt.current = 0;
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      return {
        past: [...s.past, s.present],
        present: next,
        future: rest,
      };
    });
    lastPushAt.current = 0;
  }, []);

  return {
    doc: state.present,
    update,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
