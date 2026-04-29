import { api } from "./api-client";

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface AiChat {
  id: string;
  vehicleId: string;
  title: string;
  messages?: ChatMessage[];
  _count?: { messages: number };
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  userMessage: { role: string; content: string };
  assistantMessage: { id: string; role: string; content: string };
}

export interface ChatUsage {
  used: number;
  limit: number; // -1 means unlimited
  plan: string;
}

export const aiChatApi = {
  listByVehicle: (vehicleId: string) =>
    api.get<AiChat[]>(`/ai-chat/vehicle/${vehicleId}`),

  get: (id: string) => api.get<AiChat>(`/ai-chat/${id}`),

  create: (vehicleId: string, title?: string) =>
    api.post<AiChat>("/ai-chat", { vehicleId, title }),

  sendMessage: (chatId: string, message: string) =>
    api.post<SendMessageResponse>(`/ai-chat/${chatId}/message`, { message }),

  delete: (id: string) => api.del(`/ai-chat/${id}`),

  getUsage: () => api.get<ChatUsage>("/ai-chat/usage"),
};
