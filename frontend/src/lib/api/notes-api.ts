import { api } from "./api-client";

export interface Note {
  id: string;
  vehicleId: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = "GENERAL" | "REPAIR" | "MAINTENANCE" | "OBSERVATION" | "REMINDER";

export interface CreateNoteData {
  title: string;
  content: string;
  category?: NoteCategory;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

export const notesApi = {
  list: (vehicleId: string) =>
    api.get<Note[]>(`/vehicles/${vehicleId}/notes`),

  create: (vehicleId: string, data: CreateNoteData) =>
    api.post<Note>(`/vehicles/${vehicleId}/notes`, data),

  update: (vehicleId: string, noteId: string, data: UpdateNoteData) =>
    api.patch<Note>(`/vehicles/${vehicleId}/notes/${noteId}`, data),

  delete: (vehicleId: string, noteId: string) =>
    api.del(`/vehicles/${vehicleId}/notes/${noteId}`),
};
