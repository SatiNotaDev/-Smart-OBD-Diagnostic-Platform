"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Vehicle } from "@/lib/api/vehicles-api";
import { VehicleCard } from "./vehicle-card";

interface DraggableVehicleGridProps {
  vehicles: Vehicle[];
  onDelete?: (id: string) => void;
  onReorder?: (vehicles: Vehicle[]) => void;
}

export function DraggableVehicleGrid({ vehicles, onDelete, onReorder }: DraggableVehicleGridProps) {
  const [items, setItems] = useState(vehicles);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  // Sync external changes
  if (vehicles.length !== items.length || vehicles.some((v, i) => v.id !== items[i]?.id)) {
    setItems(vehicles);
  }

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, idx: number) => {
    dragNode.current = e.currentTarget;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    }, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(idx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverIdx(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setOverIdx(null);
      return;
    }

    const newItems = [...items];
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(dropIdx, 0, moved);
    setItems(newItems);
    onReorder?.(newItems);
    setOverIdx(null);
  }, [draggedIdx, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    setDraggedIdx(null);
    setOverIdx(null);
    dragNode.current = null;
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((vehicle, idx) => (
        <motion.div
          key={vehicle.id}
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          draggable
          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
          onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, idx)}
          onDragEnd={handleDragEnd}
          className={`relative cursor-grab active:cursor-grabbing transition-all duration-150 ${
            overIdx === idx && draggedIdx !== idx
              ? "ring-2 ring-[#0070F3] ring-offset-2 rounded-xl scale-[1.02]"
              : ""
          } ${draggedIdx === idx ? "opacity-50" : ""}`}
        >
          <DragHandle />
          <VehicleCard vehicle={vehicle} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
}

function DragHandle() {
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity p-1 rounded bg-accent/80">
      <span className="block w-3 h-0.5 bg-muted rounded-full" />
      <span className="block w-3 h-0.5 bg-muted rounded-full" />
      <span className="block w-3 h-0.5 bg-muted rounded-full" />
    </div>
  );
}
