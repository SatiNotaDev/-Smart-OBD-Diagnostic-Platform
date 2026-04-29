"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  Car,
  Plus,
  ChevronRight,
  Calendar,
  LinkIcon,
  Search,
  Trash2,
  FileText,
  Pencil,
  Check,
  X,
  Sparkles,
  Download,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";
import {
  useClient,
  useLinkVehicle,
  useUnlinkVehicle,
  useUpdateClient,
  useDeleteClient,
  useClientNotes,
  useCreateClientNote,
  useUpdateClientNote,
  useDeleteClientNote,
} from "@/lib/query/use-clients";
import { useVehicles } from "@/lib/query/use-vehicles";
import { clientsApi } from "@/lib/api/clients-api";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: client, isLoading } = useClient(id);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showLinkVehicle, setShowLinkVehicle] = useState(false);
  const deleteClient = useDeleteClient();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    deleteClient.mutate(id, {
      onSuccess: () => router.push("/clients"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-24">
        <p className="text-muted">Client not found</p>
        <Button variant="outline" onClick={() => router.push("/clients")} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" />
        </div>

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              <button
                onClick={() => router.push("/clients")}
                className="mt-1.5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-background/80 backdrop-blur transition-all cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>

              {/* Avatar */}
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-blue to-cyan flex items-center justify-center text-white text-lg font-bold tracking-tight shadow-lg shadow-primary/20">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-card" />
              </div>

              <div className="pt-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {client.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-4">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="group flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Phone size={13} className="text-primary" />
                      </span>
                      {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="group flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Mail size={13} className="text-primary" />
                      </span>
                      {client.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2.5 text-muted hover:text-error hover:bg-error/8 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-6 flex gap-6 pl-[5.5rem]">
            <div className="flex items-center gap-2 text-sm">
              <Car size={14} className="text-primary" />
              <span className="text-foreground font-medium">{client.vehicles.length}</span>
              <span className="text-muted">vehicles</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gauge size={14} className="text-cyan" />
              <span className="text-foreground font-medium">
                {client.vehicles.reduce((sum, v) => sum + v.diagnostics.length, 0)}
              </span>
              <span className="text-muted">sessions</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Two-Column Layout ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Vehicles */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Car size={16} className="text-primary" />
                Vehicles
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLinkVehicle(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <LinkIcon size={12} />
                  Link
                </button>
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  New
                </button>
              </div>
            </div>

            {client.vehicles.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan/10 flex items-center justify-center">
                  <Car size={24} className="text-primary" />
                </div>
                <p className="text-sm text-muted">No vehicles linked yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {client.vehicles.map((vehicle, i) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                          <Car size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted">{vehicle.year}</span>
                            {vehicle.licensePlate && (
                              <>
                                <span className="text-xs text-border">•</span>
                                <span className="text-xs text-muted font-mono">{vehicle.licensePlate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {vehicle.diagnostics.length > 0 && (
                          <span className="text-xs text-muted tabular-nums">
                            {vehicle.diagnostics.length} diag
                          </span>
                        )}
                        <ChevronRight size={14} className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI Report */}
          <motion.div variants={fadeUp}>
            <ReportSection clientId={id} vehicles={client.vehicles} />
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <motion.div variants={fadeUp}>
            <NotesSection clientId={id} />
          </motion.div>
        </div>
      </div>

      <AddVehicleDialog
        open={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        clientId={id}
      />

      <LinkVehicleDialog
        open={showLinkVehicle}
        onClose={() => setShowLinkVehicle(false)}
        clientId={id}
        linkedVehicleIds={client.vehicles.map((v) => v.id)}
      />
    </motion.div>
  );
}

// ─── Notes Section (Timeline Style) ─────────────────────────────────────────

function NotesSection({ clientId }: { clientId: string }) {
  const { data: notes, isLoading } = useClientNotes(clientId);
  const createNote = useCreateClientNote();
  const updateNote = useUpdateClientNote();
  const deleteNote = useDeleteClientNote();
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    if (!newNote.trim()) return;
    createNote.mutate(
      { clientId, content: newNote.trim() },
      { onSuccess: () => setNewNote("") }
    );
  };

  const handleUpdate = (noteId: string) => {
    if (!editValue.trim()) return;
    updateNote.mutate(
      { clientId, noteId, content: editValue.trim() },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const handleDelete = (noteId: string) => {
    deleteNote.mutate({ clientId, noteId });
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-orange" />
          Notes
        </h2>
      </div>

      <div className="p-5">
        {/* Add note */}
        <div className="relative mb-5">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            placeholder="Write a note..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newNote.trim() || createNote.isPending}
            className="absolute right-3 bottom-3 h-7 w-7 flex items-center justify-center rounded-lg bg-primary text-white disabled:opacity-30 hover:bg-primary-hover transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : !notes || notes.length === 0 ? (
          <p className="text-xs text-muted/50 text-center py-6 italic">No notes yet</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

            <AnimatePresence>
              <div className="space-y-4">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative pl-7 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />

                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={2}
                          autoFocus
                          className="w-full rounded-lg border border-primary/30 bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/10 focus:outline-none resize-none"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-[11px] text-muted rounded border border-border hover:bg-accent transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdate(note.id)}
                            disabled={updateNote.isPending}
                            className="px-2 py-1 text-[11px] text-white bg-primary rounded hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <time className="text-[11px] text-muted/70 tabular-nums">
                            {new Date(note.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}
                            {new Date(note.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </time>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingId(note.id); setEditValue(note.content); }}
                              className="p-1 text-muted hover:text-foreground rounded transition-colors cursor-pointer"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-1 text-muted hover:text-error rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Report Section ──────────────────────────────────────────────────────

function ReportSection({
  clientId,
  vehicles,
}: {
  clientId: string;
  vehicles: Array<{ id: string; brand: string; model: string; year: number }>;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sessions, setSessions] = useState<Array<{ id: string; date: string; vehicle: string; dtcCount: number; status: string }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const handleOpen = async () => {
    setShowDialog(true);
    setLoadingSessions(true);
    try {
      const { api } = await import("@/lib/api/api-client");
      const allSessions: Array<{ id: string; date: string; vehicle: string; dtcCount: number; status: string }> = [];

      for (const v of vehicles) {
        const data = await api.get<Array<{ id: string; createdAt: string; status: string; _count: { dtcs: number } }>>(
          `/diagnostics/vehicle/${v.id}`
        );
        data.forEach((s) => {
          allSessions.push({
            id: s.id,
            date: s.createdAt,
            vehicle: `${v.brand} ${v.model} (${v.year})`,
            dtcCount: s._count?.dtcs || 0,
            status: s.status,
          });
        });
      }

      allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(allSessions);
      setSelectedIds(allSessions.slice(0, 5).map((s) => s.id));
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;
    setGenerating(true);
    try {
      const result = await clientsApi.generateReport(clientId, selectedIds);
      setReport(result.report);
      setShowDialog(false);
    } catch {
      setReport("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSession = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {/* Gradient accent strip */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-60" />

        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-purple" />
            AI Report
          </h2>
          <div className="flex gap-2">
            {report && (
              <button
                onClick={() => downloadReportPdf(report, clientId)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer"
              >
                <Download size={12} />
                PDF
              </button>
            )}
            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple to-pink rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Sparkles size={12} />
              Generate
            </button>
          </div>
        </div>

        <div className="p-6">
          {report ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(report) }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple/10 to-pink/10 flex items-center justify-center">
                <Sparkles size={20} className="text-purple" />
              </div>
              <p className="text-xs text-muted max-w-[240px]">
                Generate an AI diagnostic report based on this client&apos;s sessions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session selection dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Select Diagnostic Sessions">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Choose which sessions to include:
          </p>

          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 rounded-full border-2 border-purple border-t-transparent"
              />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No diagnostic sessions found.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <label
                  key={session.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedIds.includes(session.id)
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-border hover:bg-accent/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(session.id)}
                    onChange={() => toggleSession(session.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.vehicle}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>{session.dtcCount} DTCs</span>
                      <Badge
                        variant={session.status === "COMPLETED" ? "success" : "default"}
                      >
                        {session.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-xs text-muted tabular-nums">
              {selectedIds.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={selectedIds.length === 0 || generating}
                isLoading={generating}
                className="bg-gradient-to-r from-purple to-pink border-0 text-white"
              >
                <Sparkles size={14} className="mr-1.5" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/80">$1</li>')
    .replace(/\n/g, '<br/>');
}

function downloadReportPdf(markdown: string, _clientId: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Diagnostic Report</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a2540; line-height: 1.7; max-width: 700px; margin: 0 auto; }
    h1 { font-size: 22px; border-bottom: 2px solid #0070f3; padding-bottom: 8px; margin-top: 28px; color: #0a2540; }
    h2 { font-size: 16px; color: #0a2540; margin-top: 20px; }
    h3 { font-size: 14px; color: #4a6fa5; margin-top: 14px; }
    ul { padding-left: 18px; }
    li { margin-bottom: 5px; color: #333; }
    strong { color: #0070f3; }
    .header { text-align: center; margin-bottom: 36px; padding: 24px 0; border-bottom: 1px solid #e8f4ff; }
    .header h1 { border: none; font-size: 26px; margin: 0; color: #0070f3; }
    .header p { color: #4a6fa5; margin: 6px 0 0; font-size: 13px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8f4ff; font-size: 11px; color: #6b8db9; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Smart OBD — Diagnostic Report</h1>
    <p>${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
  </div>
  ${markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gm, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')}
  <div class="footer">
    Smart OBD Diagnostic Platform — For informational purposes only. Professional inspection recommended.
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

// ─── Link Vehicle Dialog ────────────────────────────────────────────────────

function LinkVehicleDialog({
  open,
  onClose,
  clientId,
  linkedVehicleIds,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  linkedVehicleIds: string[];
}) {
  const [search, setSearch] = useState("");
  const { data: allVehicles, isLoading } = useVehicles();
  const linkVehicle = useLinkVehicle();

  const availableVehicles = allVehicles?.filter(
    (v) => !linkedVehicleIds.includes(v.id)
  );

  const filtered = search
    ? availableVehicles?.filter(
        (v) =>
          `${v.brand} ${v.model} ${v.year}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          v.licensePlate?.toLowerCase().includes(search.toLowerCase())
      )
    : availableVehicles;

  const handleLink = (vehicleId: string) => {
    linkVehicle.mutate(
      { clientId, vehicleId },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Link Existing Vehicle">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search vehicles..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <div className="flex justify-center py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">
            No available vehicles to link.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filtered.map((vehicle, i) => (
              <motion.button
                key={vehicle.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleLink(vehicle.id)}
                disabled={linkVehicle.isPending}
                className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </p>
                  {vehicle.licensePlate && (
                    <p className="text-xs text-muted font-mono">{vehicle.licensePlate}</p>
                  )}
                </div>
                <LinkIcon size={14} className="text-primary shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
