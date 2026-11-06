/** Registry so ⌘K and note shortcuts can drive the active editor. */

export type NoteCommandId =
  | "save"
  | "undo"
  | "redo"
  | "history"
  | "summarize"
  | "auto-title"
  | "auto-tag"
  | "tasks"
  | "related"
  | "favorite"
  | "insert-image"
  | "embed-video"
  | "voice-note"
  | "open-ai"
  | "open-media"
  | "open-organize";

export type NoteCommandHandlers = Partial<
  Record<NoteCommandId, () => void | Promise<void>>
>;

let handlers: NoteCommandHandlers | null = null;
const listeners = new Set<() => void>();

export function registerNoteCommands(next: NoteCommandHandlers | null) {
  handlers = next;
  listeners.forEach((fn) => fn());
}

export function getNoteCommands() {
  return handlers;
}

export function subscribeNoteCommands(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function runNoteCommand(id: NoteCommandId) {
  const fn = handlers?.[id];
  if (!fn) return false;
  void fn();
  return true;
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}
