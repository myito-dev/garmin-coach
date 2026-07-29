import { RACE, SHOES, STRENGTH_SCHEDULE, WEEKS } from "@/data/trainingPlan";
import { WeekAccordion } from "@/components/WeekAccordion";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDateLong, todayIso } from "@/lib/format";

export const metadata = {
  title: "Plan · Garmin Coach",
};

export default function PlanPage() {
  const today = todayIso();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="eyebrow text-accent">Plan de 13 semanas</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{RACE.name}</h1>
        <p className="mt-2 text-ink-secondary">
          Objetivo {RACE.goalTimeLabel} · Carrera el {formatDateLong(RACE.date)}
        </p>
      </div>

      <GlassCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Tenis</h3>
            <ul className="space-y-1.5 text-sm text-ink-secondary">
              <li>{SHOES.Vomero}</li>
              <li>{SHOES.EvoSL}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Fuerza</h3>
            <ul className="space-y-1 text-sm text-ink-secondary">
              {STRENGTH_SCHEDULE.days.map((d) => (
                <li key={d.day}>
                  <span className="font-medium text-ink">{d.day}:</span> {d.focus}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs italic text-ink-muted">{STRENGTH_SCHEDULE.rule}</p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {WEEKS.map((week) => (
          <WeekAccordion
            key={week.weekNumber}
            week={week}
            todayIso={today}
            defaultOpen={today >= week.startDate && today <= week.endDate}
          />
        ))}
      </div>
    </div>
  );
}
