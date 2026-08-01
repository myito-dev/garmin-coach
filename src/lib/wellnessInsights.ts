import type { Insight, WellnessDay } from "./types";
import { formatHoursMinutes, hrvStatusLabel, latestRestingHr, latestSleepNight, restingHrDelta } from "./wellness";

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Recovery insights from wellness history, mirroring the training-session
 * insight engine (same severity scale) so the two feel like one coach.
 * `days` should be sorted ascending by date.
 */
export function computeWellnessInsights(days: WellnessDay[]): Insight[] {
  const insights: Insight[] = [];
  if (days.length === 0) return insights;

  const night = latestSleepNight(days);
  const hrDay = latestRestingHr(days);

  // HRV vs personal baseline
  if (night?.hrvStatus) {
    const status = night.hrvStatus;
    if (status === "BALANCED") {
      insights.push({ severity: "good", title: "HRV en tu rango balanceado", detail: `Tu HRV de anoche (${Math.round(night.avgOvernightHrv ?? 0)} ms) está dentro de tu rango personal. Buena señal de recuperación.` });
    } else if (status === "UNBALANCED") {
      insights.push({ severity: "warning", title: "HRV desbalanceado", detail: "Tu HRV de anoche salió de tu rango balanceado habitual. No es grave por un solo día, pero vale la pena bajarle un poco de intensidad si se repite." });
    } else if (status === "LOW" || status === "POOR") {
      insights.push({ severity: "serious", title: `HRV ${hrvStatusLabel(status).toLowerCase()}`, detail: "Tu HRV está notablemente por debajo de tu rango habitual — señal de fatiga acumulada, estrés o enfermedad. Considera un día de descarga o descanso." });
    }
  }

  // HRV trend: last 3 nights vs the 7 before that
  const withHrv = days.filter((d) => d.avgOvernightHrv);
  if (withHrv.length >= 6) {
    const recent = withHrv.slice(-3).map((d) => d.avgOvernightHrv!);
    const prior = withHrv.slice(-10, -3).map((d) => d.avgOvernightHrv!);
    const recentAvg = avg(recent);
    const priorAvg = avg(prior);
    if (recentAvg !== null && priorAvg !== null && priorAvg > 0) {
      const pctChange = ((recentAvg - priorAvg) / priorAvg) * 100;
      if (pctChange <= -15) {
        insights.push({ severity: "warning", title: "HRV a la baja esta semana", detail: `Tu HRV promedio de los últimos 3 días bajó ${Math.abs(Math.round(pctChange))}% frente a la semana anterior. Vigila cómo te sientes en los próximos entrenamientos.` });
      }
    }
  }

  // Resting HR vs 7-day average
  const delta = restingHrDelta(hrDay);
  if (delta !== null && delta >= 4) {
    insights.push({ severity: "warning", title: "FC en reposo elevada", detail: `Tu FC en reposo (${hrDay!.restingHeartRate} lpm) está ${delta} lpm por encima de tu promedio de 7 días — puede ser fatiga acumulada, estrés o estar por enfermarte.` });
  }

  // Sleep debt over the last 7 nights with data
  const recentNights = days.filter((d) => d.sleepSeconds).slice(-7);
  if (recentNights.length >= 3) {
    const avgSeconds = avg(recentNights.map((d) => d.sleepSeconds!));
    if (avgSeconds !== null) {
      const avgHours = avgSeconds / 3600;
      if (avgHours < 6) {
        insights.push({ severity: "serious", title: "Poco sueño esta semana", detail: `Promediando ${formatHoursMinutes(avgSeconds)} por noche en los últimos días. Menos de 6 horas de forma sostenida afecta la recuperación y el rendimiento.` });
      } else if (avgHours < 7) {
        insights.push({ severity: "warning", title: "Sueño por debajo de lo ideal", detail: `Promediando ${formatHoursMinutes(avgSeconds)} por noche. Apunta a 7-8 horas, sobre todo en semanas de carga alta.` });
      }
    }
  }

  if (insights.length === 0 || insights.every((i) => i.severity === "good")) {
    if (!insights.some((i) => i.title.includes("HRV en tu rango"))) {
      insights.unshift({ severity: "good", title: "Recuperación en buen estado", detail: "Sueño, HRV y frecuencia cardíaca en reposo se ven dentro de rangos saludables." });
    }
  }

  return insights;
}
