"use client";

import { useState, useRef } from "react";
import { Camera, Plus, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { api } from "@/lib/api/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface PhotoGalleryProps {
  vehicleId: string;
  photos: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function PhotoGallery({ vehicleId, photos }: PhotoGalleryProps) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await fetch(`${API_URL}/api/vehicles/${vehicleId}/photo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      qc.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (url: string) => {
    try {
      await api.del(`/vehicles/${vehicleId}/photo`, { url });
      qc.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    } catch {}
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Camera size={20} className="text-primary" />
          {t("dashboard.vehicles.photos.title")}
        </h3>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            className="h-8 text-xs"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <Plus size={14} className="mr-1" />
            )}
            {t("dashboard.vehicles.photos.upload")}
          </Button>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          {t("dashboard.vehicles.photos.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((url) => (
            <div key={url} className="relative group aspect-video rounded-[var(--radius)] overflow-hidden bg-accent">
              <img
                src={`${API_URL}${url}`}
                alt=""
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreview(url)}
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-1 right-1 p-1 rounded bg-[#0a2540]/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-[#0a2540]/85 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setPreview(null)}
          >
            <X size={24} />
          </button>
          <img
            src={`${API_URL}${preview}`}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
