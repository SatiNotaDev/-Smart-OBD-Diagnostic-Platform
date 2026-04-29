"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Loader2,
  Download,
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
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">Client not found</p>
        <Button variant="outline" onClick={() => router.push("/clients")} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/clients")}
            className="mt-1 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {client.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
                >
                  <Phone size={14} />
                  {client.phone}
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
                >
                  <Mail size={14} />
                  {client.email}
                </a>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-muted hover:text-error hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Notes Section */}
      <NotesSection clientId={id} />

      {/* AI Report Section */}
      <ReportSection clientId={id} vehicles={client.vehicles} />

      {/* Vehicles Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Car size={18} />
            Vehicles ({client.vehicles.length})
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLinkVehicle(true)}
              className="h-9 text-xs px-3"
            >
              <LinkIcon size={14} className="mr-1.5" />
              Link Existing
            </Button>
            <Button
              onClick={() => setShowAddVehicle(true)}
              className="h-9 text-xs px-3"
            >
              <Plus size={14} className="mr-1.5" />
              New Vehicle
            </Button>
          </div>
        </div>

        {client.vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Car size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted">
              No vehicles linked to this client yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {client.vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </p>
                    {vehicle.licensePlate && (
                      <p className="text-xs text-muted mt-0.5">
                        {vehicle.licensePlate}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {vehicle.diagnostics.length > 0 && (
                      <Badge variant="success">
                        {vehicle.diagnostics.length} session
                        {vehicle.diagnostics.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </div>

                {vehicle.diagnostics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {vehicle.diagnostics.slice(0, 3).map((diag) => (
                      <div
                        key={diag.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-muted">
                          <Calendar size={12} />
                          {new Date(diag.createdAt).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={
                            diag.status === "COMPLETED"
                              ? "success"
                              : diag.status === "FAILED"
                                ? "error"
                                : "default"
                          }
                        >
                          {diag.status.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
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
    </div>
  );
}

// ─── Notes Section ──────────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
        <FileText size={18} />
        Notes
      </h2>

      {/* Add new note */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={2}
          placeholder="Add a note..."
          className="flex-1 rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
        />
        <Button
          onClick={handleAdd}
          disabled={!newNote.trim() || createNote.isPending}
          className="h-auto self-end"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !notes || notes.length === 0 ? (
        <p className="text-sm text-muted/60 italic text-center py-4">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border p-4 group">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={2}
                    autoFocus
                    className="flex w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-muted hover:text-foreground rounded border border-border hover:bg-accent transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      disabled={updateNote.isPending}
                      className="px-2.5 py-1 text-xs text-primary-foreground bg-primary hover:bg-primary/90 rounded transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(note.id); setEditValue(note.content); }}
                        className="p-1 text-muted hover:text-foreground rounded transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-muted hover:text-error rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
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
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles size={18} />
            AI Diagnostic Report
          </h2>
          <Button onClick={handleOpen} className="h-9 text-xs px-3">
            <Sparkles size={14} className="mr-1.5" />
            Generate Report
          </Button>
        </div>

        {report ? (
          <div>
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                onClick={() => downloadReportPdf(report, clientId)}
                className="h-8 text-xs px-3"
              >
                <Download size={14} className="mr-1.5" />
                Download PDF
              </Button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(report) }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted/60 italic text-center py-4">
            Generate an AI-powered diagnostic report based on this client&apos;s sessions.
          </p>
        )}
      </div>

      {/* Session selection dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Select Diagnostic Sessions">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Choose which diagnostic sessions to include in the report:
          </p>

          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No diagnostic sessions found for this client&apos;s vehicles.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <label
                  key={session.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(session.id)}
                    onChange={() => toggleSession(session.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.vehicle}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
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

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted">
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
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br/>');
}

function downloadReportPdf(markdown: string, clientId: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Diagnostic Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; border-bottom: 2px solid #0070f3; padding-bottom: 8px; margin-top: 32px; }
    h2 { font-size: 18px; color: #333; margin-top: 24px; }
    h3 { font-size: 15px; color: #555; margin-top: 16px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    strong { color: #0070f3; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
    .header h1 { border: none; font-size: 28px; margin: 0; }
    .header p { color: #666; margin: 4px 0 0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Smart OBD — Diagnostic Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
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
    <p>Smart OBD Diagnostic Platform — This report is for informational purposes only. Professional inspection recommended.</p>
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
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">
            No available vehicles to link.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filtered.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => handleLink(vehicle.id)}
                disabled={linkVehicle.isPending}
                className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </p>
                  {vehicle.licensePlate && (
                    <p className="text-xs text-muted">{vehicle.licensePlate}</p>
                  )}
                </div>
                <LinkIcon size={16} className="text-primary shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
