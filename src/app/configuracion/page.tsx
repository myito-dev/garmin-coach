import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Configuración · Garmin Coach",
};

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="eyebrow text-accent">Preferencias</p>
        <h1 className="font-display mt-2 text-5xl sm:text-6xl">Configuración</h1>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Apariencia</p>
            <p className="text-sm text-ink-secondary">Cambia entre modo claro y oscuro.</p>
          </div>
          <ThemeToggle />
        </div>
      </GlassCard>
    </div>
  );
}
