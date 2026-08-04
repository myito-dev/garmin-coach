import type { PaceRange } from "./types";

/** "5:41" -> 341 seconds */
export function paceToSeconds(pace: string): number {
  const [min, sec] = pace.split(":").map(Number);
  return min * 60 + sec;
}

/** "~5:53/km" or "5:18/km" -> 353 seconds. Returns null if unparseable. */
export function paceLabelToSeconds(label: string): number | null {
  const match = label.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function paceRange(fast: string, slow: string): PaceRange {
  return { fastSecPerKm: paceToSeconds(fast), slowSecPerKm: paceToSeconds(slow) };
}

/** seconds per km -> "5:41" */
export function formatPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return "--:--";
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatPaceRange(range: PaceRange): string {
  return `${formatPace(range.fastSecPerKm)}-${formatPace(range.slowSecPerKm)}/km`;
}

export function mpsToSecPerKm(mps: number): number {
  if (!mps || mps <= 0) return 0;
  return 1000 / mps;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1") + " km";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00").getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
