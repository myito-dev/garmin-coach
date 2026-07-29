import { DIAGNOSIS, RACE } from "@/data/trainingPlan";
import { formatDuration, formatPace, mpsToSecPerKm } from "./format";
import { isRunningActivity } from "./planMatch";
import type { GarminActivitySummary } from "./types";

const Z2_MIN_HR = 130;
const Z2_MAX_HR = 160;
/** Only look at the last N qualifying easy runs so this tracks *current* fitness, not the whole history. */
const RECENT_EASY_RUNS_WINDOW = 10;
const RECENT_CADENCE_RUNS_WINDOW = 10;

export interface LiveRecord {
  timeLabel: string;
  distanceKm: number;
  paceLabel: string;
  date: string;
  activityName: string;
  isLive: boolean;
}

export interface LiveDiagnosis {
  best5k: LiveRecord | null;
  best10k: LiveRecord | null;
  bestHalf: LiveRecord | null;
  riegelPrediction: string | null;
  cadenceTypicalSpm: number | null;
  realZ2: { paceLabel: string; lowLabel: string; highLabel: string; sampleSize: number; trendSecPerKm: number | null } | null;
  summary: string;
  hasLiveData: boolean;
}

function bestInBucket(activities: GarminActivitySummary[], targetKm: number, tolerancePct: number): LiveRecord | null {
  const lo = targetKm * (1 - tolerancePct);
  const hi = targetKm * (1 + tolerancePct);
  const candidates = activities.filter((a) => {
    const km = a.distanceMeters / 1000;
    return km >= lo && km <= hi && a.averageSpeedMps > 0;
  });
  if (candidates.length === 0) return null;

  const best = candidates.reduce((fastest, a) => {
    const paceA = mpsToSecPerKm(a.averageSpeedMps);
    const paceFastest = mpsToSecPerKm(fastest.averageSpeedMps);
    return paceA < paceFastest ? a : fastest;
  }, candidates[0]);

  return {
    timeLabel: formatDuration(best.durationSeconds),
    distanceKm: Math.round((best.distanceMeters / 1000) * 100) / 100,
    paceLabel: `${formatPace(mpsToSecPerKm(best.averageSpeedMps))}/km`,
    date: best.startTimeLocal.slice(0, 10),
    activityName: best.activityName,
    isLive: true,
  };
}

function riegelPredict(fromDistanceKm: number, fromSeconds: number, toDistanceKm: number): string {
  const predictedSeconds = fromSeconds * Math.pow(toDistanceKm / fromDistanceKm, 1.06);
  return formatDuration(predictedSeconds);
}

/**
 * Computes a fresh coaching diagnosis from actually-synced Garmin history: personal
 * bests by distance bucket, a Riegel prediction from the live 10K, typical cadence,
 * and a real Zone 2 easy pace estimated from recent HR-in-Z2 runs (with a trend vs.
 * older Z2 runs). Falls back to the plan's seed diagnosis wherever there isn't
 * enough synced data yet, so the page never regresses to an empty state.
 */
export function computeLiveDiagnosis(activities: GarminActivitySummary[]): LiveDiagnosis {
  const running = activities.filter(isRunningActivity).filter((a) => a.distanceMeters > 0);

  const best5k = bestInBucket(running, 5, 0.1);
  const best10k = bestInBucket(running, 10, 0.08);
  const bestHalf = bestInBucket(running, RACE.distanceKm, 0.08);

  let riegelPrediction: string | null = null;
  if (best10k) {
    const best10kActivity = running.find((a) => a.activityName === best10k.activityName && a.startTimeLocal.slice(0, 10) === best10k.date);
    if (best10kActivity) {
      riegelPrediction = riegelPredict(best10kActivity.distanceMeters / 1000, best10kActivity.durationSeconds, RACE.distanceKm);
    }
  }

  const cadenceSamples = running
    .filter((a) => a.averageCadenceSpm)
    .sort((a, b) => (a.startTimeLocal < b.startTimeLocal ? 1 : -1))
    .slice(0, RECENT_CADENCE_RUNS_WINDOW);
  const cadenceTypicalSpm =
    cadenceSamples.length > 0
      ? Math.round(cadenceSamples.reduce((sum, a) => sum + (a.averageCadenceSpm ?? 0), 0) / cadenceSamples.length)
      : null;

  const easyRuns = running
    .filter((a) => a.averageHR && a.averageHR >= Z2_MIN_HR && a.averageHR <= Z2_MAX_HR)
    .sort((a, b) => (a.startTimeLocal < b.startTimeLocal ? -1 : 1));
  const recentEasyRuns = easyRuns.slice(-RECENT_EASY_RUNS_WINDOW);

  let realZ2: LiveDiagnosis["realZ2"] = null;
  if (recentEasyRuns.length >= 3) {
    const paces = recentEasyRuns.map((a) => mpsToSecPerKm(a.averageSpeedMps));
    const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
    const spread = Math.max(...paces) - Math.min(...paces);
    const half = Math.floor(recentEasyRuns.length / 2);
    let trendSecPerKm: number | null = null;
    if (half >= 2) {
      const olderAvg = paces.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const newerAvg = paces.slice(-half).reduce((a, b) => a + b, 0) / half;
      trendSecPerKm = Math.round(newerAvg - olderAvg);
    }
    realZ2 = {
      paceLabel: `${formatPace(avgPace)}/km`,
      lowLabel: formatPace(avgPace - spread / 2),
      highLabel: formatPace(avgPace + spread / 2),
      sampleSize: recentEasyRuns.length,
      trendSecPerKm,
    };
  }

  const hasLiveData = Boolean(best5k || best10k || bestHalf || realZ2);

  const parts: string[] = [];
  if (best10k) {
    parts.push(`Tu mejor 10K real es ${best10k.timeLabel} (${best10k.paceLabel}), corrido el ${best10k.date}.`);
  } else {
    parts.push(DIAGNOSIS.summary.split(".")[0] + ".");
  }
  if (bestHalf) {
    parts.push(`Tu mejor medio maratón registrado es ${bestHalf.timeLabel} (${bestHalf.paceLabel}).`);
  }
  if (riegelPrediction) {
    parts.push(`Con tu ritmo de 10K actual, la predicción Riegel para el medio da ${riegelPrediction}.`);
  }
  if (realZ2) {
    const trendNote =
      realZ2.trendSecPerKm !== null
        ? realZ2.trendSecPerKm < -3
          ? ` Va mejorando: ${Math.abs(realZ2.trendSecPerKm)}s/km más rápido que tus rodajes Z2 más viejos de esta muestra.`
          : realZ2.trendSecPerKm > 3
            ? ` Últimamente un poco más lento (${realZ2.trendSecPerKm}s/km) que tus rodajes Z2 previos — puede ser fatiga acumulada, calor, o solo variación normal.`
            : " Se mantiene estable."
        : "";
    parts.push(
      `Tu Zona 2 real (FC 130-160, últimos ${realZ2.sampleSize} rodajes fáciles) ronda ${realZ2.paceLabel}, típicamente entre ${realZ2.lowLabel} y ${realZ2.highLabel}/km.${trendNote}`
    );
  } else {
    parts.push("Aún no hay suficientes rodajes fáciles sincronizados (con FC promedio) para calcular tu Zona 2 real — sincroniza más entrenamientos para que esto se afine solo.");
  }

  return {
    best5k,
    best10k,
    bestHalf,
    riegelPrediction,
    cadenceTypicalSpm,
    realZ2,
    summary: parts.join(" "),
    hasLiveData,
  };
}
