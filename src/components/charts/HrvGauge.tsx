"use client";

import { STATUS } from "@/lib/chartColors";
import { useIsDark } from "@/lib/useIsDark";
import type { WellnessDay } from "@/lib/types";

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * A speedometer-style dial for the average HRV over the selected period,
 * with the personal "balanced" range centered — unlike Garmin's own linear
 * low-to-high scale, this flags being too far ABOVE the balanced range too,
 * not just below. The low-side threshold (hrvBaselineLowUpper) is mirrored
 * to build a symmetric high-side warning/critical zone, since Garmin's API
 * doesn't expose one, and since it's a period average rather than a single
 * night, the status label is self-classified against these same zone
 * boundaries instead of reusing Garmin's per-night hrvStatus.
 */
export function HrvGauge({ days }: { days: WellnessDay[] }) {
  const isDark = useIsDark();
  const mode = isDark ? "dark" : "light";
  const colors = {
    critical: STATUS.critical[mode],
    warning: STATUS.warning[mode],
    good: STATUS.good[mode],
  };

  const withHrv = days.filter((d) => d.avgOvernightHrv);
  const withBaseline = [...days].reverse().find((d) => d.hrvBaselineBalancedLow && d.hrvBaselineBalancedUpper);
  const balancedLow = withBaseline?.hrvBaselineBalancedLow;
  const balancedUpper = withBaseline?.hrvBaselineBalancedUpper;
  const lowUpper = withBaseline?.hrvBaselineLowUpper;

  if (withHrv.length === 0 || !balancedLow || !balancedUpper) {
    return <p className="text-sm text-ink-secondary">Todavía no hay suficiente historial para calcular tu rango.</p>;
  }

  const value = withHrv.reduce((s, d) => s + d.avgOvernightHrv!, 0) / withHrv.length;

  const gap = Math.max(1, lowUpper ? balancedLow - lowUpper : (balancedUpper - balancedLow) / 2);
  const z1 = lowUpper ?? balancedLow - gap;
  const z4 = balancedUpper + gap;
  const min = Math.max(0, z1 - gap);
  const max = z4 + gap;

  function classify(v: number, low: number, upper: number): { label: string; color: string } {
    if (v < z1) return { label: "Bajo", color: colors.critical };
    if (v < low) return { label: "Desbalanceado", color: colors.warning };
    if (v <= upper) return { label: "Balanceado", color: colors.good };
    if (v <= z4) return { label: "Desbalanceado", color: colors.warning };
    return { label: "Elevado", color: colors.critical };
  }

  const cx = 120;
  const cy = 126;
  const r = 96;
  const stroke = 22;

  const toAngle = (v: number) => 180 - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 180;

  const zones = [
    { from: min, to: z1, color: colors.critical },
    { from: z1, to: balancedLow, color: colors.warning },
    { from: balancedLow, to: balancedUpper, color: colors.good },
    { from: balancedUpper, to: z4, color: colors.warning },
    { from: z4, to: max, color: colors.critical },
  ];

  const needleTip = polar(cx, cy, r - stroke / 2 - 8, toAngle(value));
  const { label: statusLabel, color: statusColor } = classify(value, balancedLow, balancedUpper);
  const minLabel = polar(cx, cy, r + 14, 180);
  const maxLabel = polar(cx, cy, r + 14, 0);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 150" className="w-full max-w-[280px] text-ink">
        {zones.map((z) => (
          <path key={`${z.from}-${z.to}`} d={arcPath(cx, cy, r, toAngle(z.from), toAngle(z.to))} fill="none" stroke={z.color} strokeWidth={stroke} />
        ))}
        <text x={minLabel.x} y={minLabel.y + 4} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.5}>
          {Math.round(min)}
        </text>
        <text x={maxLabel.x} y={maxLabel.y + 4} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.5}>
          {Math.round(max)}
        </text>
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="currentColor" />
        <text x={cx} y={cy - 22} textAnchor="middle" fontSize="26" fontWeight="700" fill="currentColor">
          {Math.round(value)} ms
        </text>
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={statusColor}>
          {statusLabel}
        </text>
      </svg>
      <p className="mt-1 text-xs text-ink-muted">Rango balanceado: {balancedLow}-{balancedUpper} ms</p>
    </div>
  );
}
