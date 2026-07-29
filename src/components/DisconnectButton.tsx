"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DisconnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    if (!confirm("¿Borrar la sesión guardada y el caché de actividades sincronizadas?")) return;
    setLoading(true);
    try {
      await fetch("/api/garmin/disconnect", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDisconnect}
      disabled={loading}
      className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-critical/40 hover:text-critical disabled:opacity-60"
    >
      {loading ? "Borrando…" : "Desconectar y borrar caché local"}
    </button>
  );
}
