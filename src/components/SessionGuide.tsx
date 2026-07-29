import { SESSION_GUIDES } from "@/data/trainingPlan";
import type { SessionKind } from "@/lib/types";

export function SessionGuide({ kind, garminHint }: { kind: SessionKind; garminHint?: string }) {
  const guide = SESSION_GUIDES[kind];
  if (!guide) return null;
  const hint = garminHint ?? guide.garminHint;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{guide.title}</h4>
        <span className="text-xs text-ink-muted">Esfuerzo: {guide.effort}</span>
      </div>
      <ol className="space-y-2 text-sm text-ink-secondary">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {hint && (
        <div className="rounded-xl border border-hairline bg-page/60 p-3 text-xs text-ink-secondary">
          <span className="font-medium text-ink">Cómo armarlo en Garmin: </span>
          {hint}
        </div>
      )}
    </div>
  );
}
