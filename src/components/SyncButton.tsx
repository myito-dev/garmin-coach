"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { springSnappy, tapScale } from "@/lib/motion";

export function SyncButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/garmin/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo sincronizar");
      setStatus("done");
      setMessage(`${data.count} actividades sincronizadas`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al sincronizar");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <motion.button
        type="button"
        onClick={handleSync}
        disabled={status === "loading"}
        whileTap={tapScale}
        transition={springSnappy}
        className={`inline-flex items-center gap-2 rounded-full bg-accent text-accent-ink font-medium shadow-sm transition-opacity disabled:opacity-60 ${
          compact ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
        }`}
      >
        <motion.svg
          animate={{ rotate: status === "loading" ? 360 : 0 }}
          transition={status === "loading" ? { repeat: Infinity, duration: 0.9, ease: "linear" } : {}}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 11-3-6.7" />
          <path d="M21 3v6h-6" />
        </motion.svg>
        {status === "loading" ? "Sincronizando…" : "Sincronizar con Garmin"}
      </motion.button>
      {message && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs ${status === "error" ? "text-critical" : "text-ink-muted"}`}
        >
          {message}
        </motion.span>
      )}
    </div>
  );
}
