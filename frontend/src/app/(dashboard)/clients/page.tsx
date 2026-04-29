"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Car,
  ChevronRight,
  X,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  useClients,
  useClient,
  useCreateClient,
  useDeleteClient,
} from "@/lib/query/use-clients";
import type { Client } from "@/lib/api/clients-api";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients, isLoading } = useClients({
    search: search || undefined,
  });

  const deleteClient = useDeleteClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    deleteClient.mutate(id);
    if (selectedClientId === id) setSelectedClientId(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search clients..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-1.5" />
          Add Client
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !clients || clients.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No clients yet
          </h3>
          <p className="text-sm text-muted max-w-sm">
            Add your first client to start managing their vehicles and
            diagnostic history.
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1.5" />
            Add Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isSelected={selectedClientId === client.id}
              onSelect={() => setSelectedClientId(client.id)}
              onDelete={() => handleDelete(client.id)}
            />
          ))}
        </div>
      )}

      {/* Client Detail Panel */}
      {selectedClientId && (
        <ClientDetailPanel
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}

      {/* Add dialog */}
      <AddClientDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

// ─── Client Card ─────────────────────────────────────────────────────────────

function ClientCard({
  client,
  isSelected,
  onSelect,
  onDelete,
}: {
  client: Client;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground truncate">
            {client.name}
          </h3>
          <div className="mt-2 space-y-1">
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone size={14} />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Mail size={14} />
                <span className="truncate">{client.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Badge>
            <Car size={12} className="mr-1" />
            {client.vehicles.length}
          </Badge>
          <ChevronRight size={16} className="text-muted" />
        </div>
      </div>

      {client.vehicles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {client.vehicles.slice(0, 3).map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-foreground"
              >
                {v.brand} {v.model} {v.year}
              </span>
            ))}
            {client.vehicles.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs text-muted">
                +{client.vehicles.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-xs text-muted hover:text-error transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Client Detail Panel ─────────────────────────────────────────────────────

function ClientDetailPanel({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { data: client, isLoading } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {client.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
            {client.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {client.email}
              </span>
            )}
          </div>
          {client.notes && (
            <p className="mt-3 text-sm text-muted">{client.notes}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Vehicles and Diagnostics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Car size={16} />
          Vehicles ({client.vehicles.length})
        </h3>
        {client.vehicles.length === 0 ? (
          <p className="text-sm text-muted py-4">
            No vehicles associated with this client.
          </p>
        ) : (
          <div className="space-y-3">
            {client.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="rounded-xl border border-border p-4"
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
                  {vehicle.diagnostics.length > 0 && (
                    <Badge variant="success">
                      {vehicle.diagnostics.length} session
                      {vehicle.diagnostics.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {vehicle.diagnostics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {vehicle.diagnostics.map((diag) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Client Dialog ───────────────────────────────────────────────────────

function AddClientDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const createClient = useCreateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Client name is required");
      return;
    }

    createClient.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setPhone("");
          setEmail("");
          setNotes("");
          onClose();
        },
        onError: (err: any) => {
          setError(err?.message || "Failed to create client");
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Client">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name *"
          placeholder="John Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="w-full space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            placeholder="Additional notes about this client..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="flex w-full rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
          />
        </div>

        {error && (
          <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createClient.isPending}>
            Add Client
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
