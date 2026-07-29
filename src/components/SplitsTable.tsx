import { formatPace, mpsToSecPerKm } from "@/lib/format";
import type { ActivitySplit } from "@/lib/types";

export function SplitsTable({ splits }: { splits: ActivitySplit[] }) {
  const kmSplits = splits.filter((s) => s.distanceMeters >= 200);
  if (kmSplits.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
            <th className="pb-2 pr-3">Km</th>
            <th className="pb-2 pr-3">Ritmo</th>
            <th className="pb-2 pr-3">FC</th>
            <th className="pb-2 pr-3">Cadencia</th>
            <th className="pb-2">Desnivel +</th>
          </tr>
        </thead>
        <tbody className="tabular divide-y divide-hairline">
          {kmSplits.map((s) => (
            <tr key={s.index}>
              <td className="py-2 pr-3 font-medium">{s.index}</td>
              <td className="py-2 pr-3">{formatPace(mpsToSecPerKm(s.averageSpeedMps))}/km</td>
              <td className="py-2 pr-3 text-ink-secondary">{s.averageHR ? `${s.averageHR} bpm` : "—"}</td>
              <td className="py-2 pr-3 text-ink-secondary">{s.averageCadenceSpm ? `${Math.round(s.averageCadenceSpm)} spm` : "—"}</td>
              <td className="py-2 text-ink-secondary">{s.elevationGainM ? `${Math.round(s.elevationGainM)} m` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
