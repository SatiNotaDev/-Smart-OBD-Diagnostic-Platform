"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notesApi,
  type Note,
  type CreateNoteData,
  type UpdateNoteData,
} from "@/lib/api/notes-api";

const noteKeys = {
  all: (vehicleId: string) => ["notes", vehicleId] as const,
};

export function useNotes(vehicleId: string) {
  return useQuery<Note[]>({
    queryKey: noteKeys.all(vehicleId),
    queryFn: () => notesApi.list(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useCreateNote(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteData) => notesApi.create(vehicleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all(vehicleId) });
    },
  });
}

export function useUpdateNote(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UpdateNoteData }) =>
      notesApi.update(vehicleId, noteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all(vehicleId) });
    },
  });
}

export function useDeleteNote(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => notesApi.delete(vehicleId, noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all(vehicleId) });
    },
  });
}
