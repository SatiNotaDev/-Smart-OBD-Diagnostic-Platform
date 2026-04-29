"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiChatApi, type AiChat } from "@/lib/api/ai-chat-api";

const chatKeys = {
  all: (vehicleId: string) => ["ai-chats", vehicleId] as const,
  detail: (id: string) => ["ai-chat", id] as const,
};

export function useAiChats(vehicleId: string) {
  return useQuery<AiChat[]>({
    queryKey: chatKeys.all(vehicleId),
    queryFn: () => aiChatApi.listByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useAiChat(id: string) {
  return useQuery<AiChat>({
    queryKey: chatKeys.detail(id),
    queryFn: () => aiChatApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAiChat(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => aiChatApi.create(vehicleId, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.all(vehicleId) });
    },
  });
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => aiChatApi.sendMessage(chatId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
    },
  });
}

export function useDeleteAiChat(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiChatApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.all(vehicleId) });
    },
  });
}
