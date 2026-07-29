import { DIAGNOSIS, HR_ZONES, RACE } from "@/data/trainingPlan";
import { formatPace, mpsToSecPerKm } from "./format";
import type { ActivityAnalysis, ActivitySplit, GarminActivitySummary, Insight, PlannedSession } from "./types";

const EASY_KINDS = new Set(["rodaje", "long_run"]);
const QUALITY_KINDS = new Set(["tempo", "intervalos", "ritmo_carrera", "fartlek"]);
const PACE_TOLERANCE_SEC = 8;

/**
 * Sessions built from alternating work/recovery blocks (by time, not distance).
 * The watch's auto-laps are ~1km regardless, so they don't line up with the
 * actual intervals, and the whole-activity average pace blends hard reps with
 * jogged recoveries and warm-up/cool-down — comparing that average to the
 * target pace (which is only for the work bursts) is misleading either way.
 */
const INTERVAL_STRUCTURED_KINDS = new Set(["fartlek", "intervalos"]);

/**
 * Sessions that are one continuous effort (no recovery jogs) but still bookended
 * by an easy warm-up and cool-down. When splits are available we can trim the
 * first/last km and compare target pace against just the core block instead of
 * the whole-activity average.
 */
const CONTINUOUS_EFFORT_KINDS = new Set(["tempo", "ritmo_carrera", "long_run"]);
const MIN_SPLIT_METERS = 200;

/** Distance-weighted average pace across splits, optionally trimming the first/last (assumed warm-up/cool-down). */
function corePaceFromSplits(splits: ActivitySplit[], trimEnds: boolean): { paceSecPerKm: number; usedSplits: number } | null {
  const kmSplits = splits.filter((s) => s.distanceMeters >= MIN_SPLIT_METERS);
  const core = trimEnds && kmSplits.length >= 3 ? kmSplits.slice(1, -1) : kmSplits;
  if (core.length === 0) return null;
  const totalDistance = core.reduce((sum, s) => sum + s.distanceMeters, 0);
  const totalDuration = core.reduce((sum, s) => sum + s.durationSeconds, 0);
  if (totalDistance === 0) return null;
  return { paceSecPerKm: (totalDuration / totalDistance) * 1000, usedSplits: core.length };
}

export function hrZoneFor(bpm: number): number {
  for (const z of HR_ZONES) {
    if (bpm >= z.min && (z.max === null || bpm <= z.max)) return z.zone;
  }
  return 1;
}

export function analyzeActivity(
  activity: GarminActivitySummary,
  planned: PlannedSession | null,
  splits?: ActivitySplit[] | null
): ActivityAnalysis {
  const avgPaceSecPerKm = mpsToSecPerKm(activity.averageSpeedMps);
  const paceLabel = formatPace(avgPaceSecPerKm);
  const distanceKm = activity.distanceMeters / 1000;

  const insights: Insight[] = [];

  let paceOnTarget: boolean | null = null;
  let distanceOnTarget: boolean | null = null;
  let comparePaceSecPerKm = avgPaceSecPerKm;
  let usedCorePace = false;

  const isIntervalStructured = planned ? INTERVAL_STRUCTURED_KINDS.has(planned.kind) : false;
  const paceGradingSkipped = Boolean(planned?.pace && isIntervalStructured);

  if (planned?.pace && isIntervalStructured) {
    // Whole-activity average blends work reps, jogged recoveries, and warm-up/cool-down —
    // not comparable to a target pace meant only for the fast bursts. Skip grading it.
    insights.push({
      severity: "good",
      title: "Sesión con bloques de trabajo/recuperación",
      detail: `El ritmo promedio (${paceLabel}/km) mezcla calentamiento, recuperaciones trotadas y enfriamiento junto con los tramos rápidos, así que no se compara contra el objetivo (${formatPace(planned.pace.fastSecPerKm)}-${formatPace(planned.pace.slowSecPerKm)}/km) — ese es solo para los bloques de trabajo. Revisa los splits más rápidos de la sesión para ver si los tocaste.`,
    });
  } else if (planned?.pace) {
    const trimEnds = CONTINUOUS_EFFORT_KINDS.has(planned.kind);
    const core = splits && splits.length > 0 ? corePaceFromSplits(splits, trimEnds) : null;
    const usingCorePace = trimEnds && core !== null;
    const comparePace = usingCorePace ? core!.paceSecPerKm : avgPaceSecPerKm;
    const compareLabel = formatPace(comparePace);
    comparePaceSecPerKm = comparePace;
    usedCorePace = usingCorePace;

    const { fastSecPerKm, slowSecPerKm } = planned.pace;
    paceOnTarget = comparePace >= fastSecPerKm - PACE_TOLERANCE_SEC && comparePace <= slowSecPerKm + PACE_TOLERANCE_SEC;
    const blockNote = usingCorePace
      ? ` (ritmo del bloque principal, sin contar calentamiento/enfriamiento — el promedio de toda la actividad fue ${paceLabel}/km)`
      : "";

    if (comparePace < fastSecPerKm - PACE_TOLERANCE_SEC) {
      const diff = Math.round(fastSecPerKm - comparePace);
      if (EASY_KINDS.has(planned.kind)) {
        insights.push({
          severity: "warning",
          title: "Fuiste más rápido de lo indicado",
          detail: `Corriste a ${compareLabel}/km${blockNote}, ${diff}s/km más rápido que el rango fácil (${formatPace(fastSecPerKm)}-${formatPace(slowSecPerKm)}/km). En días de rodaje el objetivo es acumular kilómetros sin fatiga, no ganar velocidad — vigila que no te esté pasando lo mismo que en CDMX (salir demasiado fuerte pasa factura al final).`,
        });
      } else {
        insights.push({
          severity: "good",
          title: "Ritmo por debajo del objetivo",
          detail: `${diff}s/km más rápido que el rango planeado${blockNote}. Si se sintió controlado (6-7/10), es una buena señal de forma; si te costó sostenerlo, no fuerces la próxima vez.`,
        });
      }
    } else if (comparePace > slowSecPerKm + PACE_TOLERANCE_SEC) {
      const diff = Math.round(comparePace - slowSecPerKm);
      if (QUALITY_KINDS.has(planned.kind)) {
        insights.push({
          severity: "serious",
          title: "Ritmo más lento que el objetivo de calidad",
          detail: `Corriste a ${compareLabel}/km${blockNote}, ${diff}s/km más lento que el rango objetivo (${formatPace(fastSecPerKm)}-${formatPace(slowSecPerKm)}/km). Revisa fatiga acumulada, sueño o calor antes de forzar el ritmo la próxima vez.`,
        });
      } else {
        insights.push({
          severity: "good",
          title: "Ritmo conservador",
          detail: `Fuiste ${diff}s/km más lento que el rango${blockNote} — perfecto para un día fácil si el objetivo era recuperar.`,
        });
      }
    } else {
      insights.push({
        severity: "good",
        title: "Ritmo dentro del objetivo",
        detail: `${compareLabel}/km${blockNote} cae dentro del rango planeado (${formatPace(fastSecPerKm)}-${formatPace(slowSecPerKm)}/km). Buena ejecución.`,
      });
    }
  }

  if (planned?.distanceKm) {
    const diffKm = distanceKm - planned.distanceKm;
    const tolerance = Math.max(1, planned.distanceKm * 0.15);
    distanceOnTarget = Math.abs(diffKm) <= tolerance;
    if (!distanceOnTarget) {
      insights.push({
        severity: diffKm < 0 ? "warning" : "good",
        title: diffKm < 0 ? "Distancia por debajo del plan" : "Distancia por encima del plan",
        detail: `Planeados ${planned.distanceKm} km, corriste ${distanceKm.toFixed(1)} km (${diffKm > 0 ? "+" : ""}${diffKm.toFixed(1)} km).`,
      });
    }
  }

  if (activity.averageHR) {
    const zone = hrZoneFor(activity.averageHR);
    if (planned && EASY_KINDS.has(planned.kind) && zone >= 4) {
      insights.push({
        severity: "critical",
        title: `FC promedio en Zona ${zone} durante un día fácil`,
        detail: `${activity.averageHR} bpm de promedio es la misma señal de arranque descontrolado que en el medio de CDMX (FC pegada en zona alta desde el km 3). En un rodaje Z2 la FC debería mantenerse mayormente por debajo de ${HR_ZONES[2].min} bpm.`,
      });
    } else if (planned && EASY_KINDS.has(planned.kind) && zone === 3) {
      insights.push({
        severity: "warning",
        title: "FC un poco alta para un día fácil",
        detail: `${activity.averageHR} bpm promedio (Zona 3). No es grave, pero si se repite seguido conviene bajar el ritmo unos segundos.`,
      });
    } else if (activity.maxHR && activity.maxHR >= 195) {
      insights.push({
        severity: "warning",
        title: "Frecuencia cardíaca máxima muy alta",
        detail: `Pico de ${activity.maxHR} bpm, cerca de tu máxima registrada en CDMX (195 bpm). Confirma que fue una sesión de alta intensidad intencional.`,
      });
    }
  }

  if (activity.averageCadenceSpm) {
    const [goalMin] = DIAGNOSIS.cadenceGoalSpm;
    if (planned && (planned.kind === "ritmo_carrera" || planned.kind === "carrera") && activity.averageCadenceSpm < goalMin - 4) {
      insights.push({
        severity: "warning",
        title: "Cadencia por debajo de tu objetivo",
        detail: `${Math.round(activity.averageCadenceSpm)} spm frente a tu meta de ${DIAGNOSIS.cadenceGoalSpm[0]}-${DIAGNOSIS.cadenceGoalSpm[1]} spm en tramos rápidos. Subirla un poco ayuda a la economía de carrera sin cambiar el ritmo.`,
      });
    }
  }

  if (planned?.kind === "carrera" && activity.distanceMeters / 1000 >= RACE.distanceKm - 1) {
    const totalMinutes = activity.durationSeconds / 60;
    const goalMinutes = RACE.goalSeconds / 60;
    insights.push({
      severity: totalMinutes <= goalMinutes ? "good" : "warning",
      title: totalMinutes <= goalMinutes ? "¡Bajo el objetivo!" : "Por encima del objetivo",
      detail: `Tiempo total: ${Math.floor(totalMinutes)} min frente a la meta de ${Math.floor(goalMinutes)} min.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      severity: "good",
      title: "Actividad registrada",
      detail: "No hay una sesión planeada con la que comparar este entrenamiento en detalle, pero quedó guardado en tu historial.",
    });
  }

  // Derive the score from the same severities shown in the insight cards, so the
  // number never contradicts what the text says (e.g. two "good" insights can't
  // produce a red score just because the raw pace/distance differed from plan).
  const SEVERITY_PENALTY: Record<Insight["severity"], number> = {
    good: 0,
    warning: 12,
    serious: 28,
    critical: 45,
  };
  const totalPenalty = insights.reduce((sum, i) => sum + SEVERITY_PENALTY[i.severity], 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));

  return {
    activity,
    planned,
    avgPaceSecPerKm,
    paceLabel,
    comparePaceSecPerKm,
    usedCorePace,
    paceGradingSkipped,
    adherence: { paceOnTarget, distanceOnTarget, score },
    insights,
  };
}

/** Whether this session kind's pace shouldn't be graded against a single target range (see INTERVAL_STRUCTURED_KINDS). */
export function isPaceGradingUnreliable(kind: string): boolean {
  return INTERVAL_STRUCTURED_KINDS.has(kind);
}
