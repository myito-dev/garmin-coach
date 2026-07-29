import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Configuración · Puebla 21K",
};

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="text-sm font-medium text-accent">Preferencias</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Configuración</h1>
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
