import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { RecoveryCard } from "@/components/RecoveryCard";
import { SaludHistory } from "@/components/SaludHistory";
import { readWellnessCache } from "@/lib/store";

export const metadata = {
  title: "Salud · Garmin Coach",
};

// Reads live Redis state (synced wellness data) — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function SaludPage() {
  const wellness = await readWellnessCache();
  const days = wellness.days;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="eyebrow text-accent">Bienestar</p>
        <h1 className="font-display mt-2 text-5xl sm:text-6xl">Salud</h1>
        <p className="mt-2 text-ink-secondary">
          Sueño, HRV y frecuencia cardíaca en reposo de tu reloj Garmin — señales de recuperación que complementan el
          plan de entrenamiento.
        </p>
      </div>

      {days.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-ink-secondary">
            Todavía no hay datos de bienestar sincronizados. Ve a{" "}
            <Link href="/configuracion" className="font-medium text-accent">
              Configuración
            </Link>{" "}
            y presiona &ldquo;Sincronizar con Garmin&rdquo;.
          </p>
        </GlassCard>
      ) : (
        <>
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Última noche</h2>
            <RecoveryCard days={days} />
          </GlassCard>

          <SaludHistory initialDays={days} />
        </>
      )}
    </div>
  );
}
