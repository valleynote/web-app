"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Editor } from "@tiptap/react";
import type { NoteToolsTab } from "@/components/editor/NoteToolsBar";

export type NoteChromeState = {
  active: boolean;
  noteId: string | null;
  editor: Editor | null;
  toolsTab: NoteToolsTab | null;
  setToolsTab: (tab: NoteToolsTab | null) => void;
};

type NoteChromeApi = NoteChromeState & {
  register: (state: {
    noteId: string;
    editor: Editor | null;
    toolsTab: NoteToolsTab | null;
    setToolsTab: (tab: NoteToolsTab | null) => void;
  }) => void;
  unregister: () => void;
};

const NoteChromeContext = createContext<NoteChromeApi | null>(null);

const noopSetTab = (_tab: NoteToolsTab | null) => {};

export function NoteChromeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NoteChromeState>({
    active: false,
    noteId: null,
    editor: null,
    toolsTab: null,
    setToolsTab: noopSetTab,
  });

  const register = useCallback(
    (next: {
      noteId: string;
      editor: Editor | null;
      toolsTab: NoteToolsTab | null;
      setToolsTab: (tab: NoteToolsTab | null) => void;
    }) => {
      setState({
        active: true,
        noteId: next.noteId,
        editor: next.editor,
        toolsTab: next.toolsTab,
        setToolsTab: next.setToolsTab,
      });
    },
    [],
  );

  const unregister = useCallback(() => {
    setState({
      active: false,
      noteId: null,
      editor: null,
      toolsTab: null,
      setToolsTab: noopSetTab,
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, register, unregister }),
    [state, register, unregister],
  );

  return (
    <NoteChromeContext.Provider value={value}>
      {children}
    </NoteChromeContext.Provider>
  );
}

export function useNoteChrome() {
  const ctx = useContext(NoteChromeContext);
  if (!ctx) {
    throw new Error("useNoteChrome must be used within NoteChromeProvider");
  }
  return ctx;
}
