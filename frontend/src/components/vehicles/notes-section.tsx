"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  StickyNote,
  Wrench,
  ClipboardCheck,
  Eye,
  Bell,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/lib/query/use-notes";
import { useI18n } from "@/lib/i18n/i18n";
import type { Note, NoteCategory } from "@/lib/api/notes-api";

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const categoryIcons: Record<NoteCategory, typeof StickyNote> = {
  GENERAL: StickyNote,
  REPAIR: Wrench,
  MAINTENANCE: ClipboardCheck,
  OBSERVATION: Eye,
  REMINDER: Bell,
};

const categoryVariant: Record<NoteCategory, "default" | "success" | "warning" | "error"> = {
  GENERAL: "default",
  REPAIR: "error",
  MAINTENANCE: "warning",
  OBSERVATION: "success",
  REMINDER: "default",
};

interface NotesSectionProps {
  vehicleId: string;
}

export function NotesSection({ vehicleId }: NotesSectionProps) {
  const { t } = useI18n();
  const { data: notes, isLoading } = useNotes(vehicleId);
  const createNote = useCreateNote(vehicleId);
  const updateNote = useUpdateNote(vehicleId);
  const deleteNote = useDeleteNote(vehicleId);

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const categoryOptions = [
    { value: "GENERAL", label: t("dashboard.vehicles.notes.categoryGeneral") },
    { value: "REPAIR", label: t("dashboard.vehicles.notes.categoryRepair") },
    { value: "MAINTENANCE", label: t("dashboard.vehicles.notes.categoryMaintenance") },
    { value: "OBSERVATION", label: t("dashboard.vehicles.notes.categoryObservation") },
    { value: "REMINDER", label: t("dashboard.vehicles.notes.categoryReminder") },
  ];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: editingNote?.title || "",
      content: editingNote?.content || "",
      category: editingNote?.category || "GENERAL",
    },
  });

  const openCreate = () => {
    setEditingNote(null);
    reset({ title: "", content: "", category: "GENERAL" });
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    reset({ title: note.title, content: note.content, category: note.category });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
    reset();
  };

  const onSubmit = (values: FormValues) => {
    const data = {
      title: values.title,
      content: values.content,
      category: (values.category || "GENERAL") as NoteCategory,
    };

    if (editingNote) {
      updateNote.mutate(
        { noteId: editingNote.id, data },
        { onSuccess: closeForm },
      );
    } else {
      createNote.mutate(data, { onSuccess: closeForm });
    }
  };

  const handleDelete = (noteId: string) => {
    if (!confirm(t("dashboard.vehicles.notes.deleteConfirm"))) return;
    deleteNote.mutate(noteId);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("dashboard.vehicles.notes.title")}
        </h3>
        <Button onClick={openCreate} className="h-8 text-xs">
          <Plus size={14} className="mr-1" />
          {t("dashboard.vehicles.notes.add")}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-5 p-4 rounded-[var(--radius)] border border-border bg-accent/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {editingNote ? t("dashboard.vehicles.notes.editNote") : t("dashboard.vehicles.notes.newNote")}
            </span>
            <button type="button" onClick={closeForm} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                placeholder={t("dashboard.vehicles.notes.titlePlaceholder")}
                error={errors.title?.message}
                {...register("title")}
              />
              <Select
                options={categoryOptions}
                {...register("category")}
              />
            </div>
            <textarea
              className="w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[80px]"
              placeholder={t("dashboard.vehicles.notes.contentPlaceholder")}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-error">{errors.content.message}</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" isLoading={createNote.isPending || updateNote.isPending} className="h-8 text-xs">
                {editingNote ? t("dashboard.vehicles.notes.save") : t("dashboard.vehicles.notes.add")}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !notes || notes.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          {t("dashboard.vehicles.notes.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => {
            const Icon = categoryIcons[note.category] || StickyNote;
            return (
              <div
                key={note.id}
                className="flex gap-3 p-3 rounded-[var(--radius)] border border-border hover:bg-accent/30 transition-colors"
              >
                <Icon size={16} className="text-muted mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {note.title}
                    </span>
                    <Badge variant={categoryVariant[note.category]} className="text-[10px] px-1.5 py-0">
                      {categoryOptions.find((c) => c.value === note.category)?.label || note.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <span className="text-[10px] text-muted mt-1 block">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(note)}
                    className="p-1.5 rounded text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded text-muted hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
