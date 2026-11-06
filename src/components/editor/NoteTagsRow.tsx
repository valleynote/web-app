"use client";

import { useEffect, useState, useTransition } from "react";
import { Hash, Loader2 } from "lucide-react";
import {
  getNoteTagsAction,
  removeNoteTagAction,
} from "@/server/actions/tags";
import AddTagModal from "@/components/editor/AddTagModal";

type Tag = { id: string; name: string; color: string };

export default function NoteTagsRow({
  noteId,
  refreshKey = 0,
}: {
  noteId: string;
  refreshKey?: number;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void getNoteTagsAction(noteId).then(setTags).catch(() => setTags([]));
  }, [noteId, refreshKey]);

  useEffect(() => {
    function onRefresh() {
      void getNoteTagsAction(noteId).then(setTags).catch(() => setTags([]));
    }
    window.addEventListener("valleynote:tags-changed", onRefresh);
    return () => window.removeEventListener("valleynote:tags-changed", onRefresh);
  }, [noteId]);

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            title="Remove tag"
            onClick={() => {
              startTransition(async () => {
                await removeNoteTagAction(noteId, tag.id);
                setTags((t) => t.filter((x) => x.id !== tag.id));
                window.dispatchEvent(new Event("valleynote:tags-changed"));
              });
            }}
            className="rounded-full px-2.5 py-1 font-switzer text-[11px] font-medium transition hover:opacity-80"
            style={{ background: `${tag.color}18`, color: tag.color }}
          >
            #{tag.name}
          </button>
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-bg-border px-2.5 py-1 font-switzer text-[11px] font-medium text-muted transition hover:border-blue/35 hover:text-ink disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Hash size={11} strokeWidth={1.85} />
          )}
          Add tag
        </button>
      </div>

      <AddTagModal
        noteId={noteId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={(tag) => {
          setTags((t) => (t.some((x) => x.id === tag.id) ? t : [...t, tag]));
        }}
      />
    </>
  );
}
