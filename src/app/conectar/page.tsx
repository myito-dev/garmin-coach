import { isGarminConfigured } from "@/lib/garmin";
import { hasStoredToken, readActivitiesCache } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { SyncButton } from "@/components/SyncButton";
import { DisconnectButton } from "@/components/DisconnectButton";

export const metadata = {
  title: "Conectar Garmin · Garmin Coach",
};

// Reads live Redis state (session + sync status) — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function ConectarPage() {
  const configured = isGarminConfigured();
  const [connected, cache] = await Promise.all([hasStoredToken(), readActivitiesCache()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="eyebrow text-accent">Puente con Garmin Connect</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Conectar tu reloj</h1>
        <p className="mt-2 text-ink-secondary">
          Esta app se conecta a tu cuenta de Garmin Connect desde el servidor, con tus credenciales guardadas
          de forma privada como variables de entorno — nunca se envían al navegador ni a ningún tercero.
        </p>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusDot ok={configured} />
            <div>
              <p className="font-medium">Credenciales configuradas</p>
              <p className="text-sm text-ink-secondary">
                {configured ? "GARMIN_EMAIL y GARMIN_PASSWORD están definidas." : "Falta agregar tus credenciales en .env.local."}
              </p>
            </div>
          </div>
        </div>
        <div className="my-4 h-px bg-hairline" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusDot ok={connected} />
            <div>
              <p className="font-medium">Sesión activa</p>
              <p className="text-sm text-ink-secondary">
                {connected ? "Hay un token de sesión guardado en la base de datos." : "Aún no se ha iniciado sesión."}
              </p>
            </div>
          </div>
        </div>
        <div className="my-4 h-px bg-hairline" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Caché de actividades</p>
            <p className="text-sm text-ink-secondary">
              {cache.lastSyncedAt
                ? `${cache.activities.length} actividades · última sync ${new Date(cache.lastSyncedAt).toLocaleString("es-MX")}`
                : "Sin sincronizar todavía"}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SyncButton />
          {connected && <DisconnectButton />}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-3 text-lg font-semibold">Cómo configurar tus credenciales</h2>
        <ol className="space-y-3 text-sm text-ink-secondary">
          <li className="flex gap-2.5">
            <Step n={1} />
            <span>
              En la carpeta del proyecto, copia <code className="rounded bg-page px-1.5 py-0.5 text-xs">.env.local.example</code> a{" "}
              <code className="rounded bg-page px-1.5 py-0.5 text-xs">.env.local</code>.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Step n={2} />
            <span>
              Agrega tu correo y contraseña de Garmin Connect como{" "}
              <code className="rounded bg-page px-1.5 py-0.5 text-xs">GARMIN_EMAIL</code> y{" "}
              <code className="rounded bg-page px-1.5 py-0.5 text-xs">GARMIN_PASSWORD</code>.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Step n={3} />
            <span>Reinicia el servidor de desarrollo y presiona &quot;Sincronizar con Garmin&quot; arriba.</span>
          </li>
        </ol>
        <div className="mt-4 rounded-xl border border-hairline bg-page/60 p-3 text-xs text-ink-muted">
          Esta app usa una librería no oficial que inicia sesión como tú lo harías desde el navegador. Garmin no
          ofrece una API pública sencilla para desarrolladores individuales, así que las credenciales solo viven en
          variables de entorno del servidor (nunca se suben a git ni llegan al navegador) y el token de sesión se
          guarda en tu base de datos Redis privada. Comparte esta app solo con quien confíes.
        </div>
      </GlassCard>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ background: ok ? "color-mix(in oklab, var(--good) 15%, transparent)" : "color-mix(in oklab, var(--critical) 12%, transparent)" }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ok ? "var(--good)" : "var(--critical)" }} />
    </span>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
      {n}
    </span>
  );
}
