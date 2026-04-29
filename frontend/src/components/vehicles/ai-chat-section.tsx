"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Plus, Send, Trash2, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiChats, useAiChat, useCreateAiChat, useSendMessage, useDeleteAiChat } from "@/lib/query/use-ai-chat";
import { useI18n } from "@/lib/i18n/i18n";

interface AiChatSectionProps {
  vehicleId: string;
}

export function AiChatSection({ vehicleId }: AiChatSectionProps) {
  const { t } = useI18n();
  const { data: chats, isLoading: chatsLoading } = useAiChats(vehicleId);
  const createChat = useCreateAiChat(vehicleId);
  const deleteChat = useDeleteAiChat(vehicleId);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleNewChat = () => {
    createChat.mutate(undefined, {
      onSuccess: (chat) => setActiveChatId(chat.id),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("dashboard.vehicles.chat.deleteConfirm"))) return;
    deleteChat.mutate(id);
    if (activeChatId === id) setActiveChatId(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bot size={20} className="text-primary" />
          {t("dashboard.vehicles.chat.title")}
        </h3>
        <Button onClick={handleNewChat} className="h-8 text-xs" isLoading={createChat.isPending}>
          <Plus size={14} className="mr-1" />
          {t("dashboard.vehicles.chat.newChat")}
        </Button>
      </div>

      <div className="flex h-[400px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-border overflow-y-auto shrink-0 bg-accent/20">
          {chatsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          ) : !chats || chats.length === 0 ? (
            <p className="text-xs text-muted p-3 text-center">
              {t("dashboard.vehicles.chat.noChats")}
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-1 px-3 py-2 border-b border-border cursor-pointer transition-colors ${
                  activeChatId === chat.id ? "bg-primary/10" : "hover:bg-accent/50"
                }`}
              >
                <button
                  type="button"
                  className="flex-1 text-left min-w-0"
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <span className="text-xs font-medium text-foreground block truncate">
                    {chat.title}
                  </span>
                  <span className="text-[10px] text-muted">
                    {chat._count?.messages || 0} msg
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(chat.id)}
                  className="p-1 rounded text-muted hover:text-error shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeChatId ? (
            <ChatWindow chatId={activeChatId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare size={32} className="text-muted mb-3" />
              <p className="text-sm text-muted">
                {t("dashboard.vehicles.chat.selectOrCreate")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ chatId }: { chatId: string }) {
  const { t } = useI18n();
  const { data: chat, isLoading } = useAiChat(chatId);
  const sendMessage = useSendMessage(chatId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(!chat?.messages || chat.messages.length === 0) && (
          <p className="text-xs text-muted text-center py-8">
            {t("dashboard.vehicles.chat.startConversation")}
          </p>
        )}
        {chat?.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "USER" ? "justify-end" : ""}`}
          >
            {msg.role === "ASSISTANT" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={14} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "USER"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "USER" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-accent flex items-center justify-center">
                <User size={14} className="text-muted" />
              </div>
            )}
          </div>
        ))}
        {sendMessage.isPending && (
          <div className="flex gap-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-accent rounded-xl px-3 py-2">
              <Loader2 size={14} className="animate-spin text-muted" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("dashboard.vehicles.chat.placeholder")}
          className="flex-1 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          disabled={sendMessage.isPending}
        />
        <Button
          type="submit"
          disabled={!input.trim() || sendMessage.isPending}
          className="h-9 w-9 p-0"
        >
          <Send size={15} />
        </Button>
      </form>
    </>
  );
}
