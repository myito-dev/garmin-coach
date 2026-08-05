"use client";

import { Gauge } from "./gauge";
import { STATUS } from "@/lib/chartColors";
import type { WellnessDay } from "@/lib/types";

/**
 * HRV fill gauge for the average over the selected period. Built on bklit's
 * generic 0-100 notch gauge — note this trades away the earlier custom dial's
 * centered-balanced-range arc (color zones visible at a glance, needle
 * position) for bklit's progressive fill instead. The fill percentage still
 * encodes where the value sits inside the personal [min, max] band, and the
 * color reflects the same classification (balanced/unbalanced/low/elevated),
 * so the read is similar — just via fill level instead of a zoned arc.
 */
export function HrvGauge({ days }: { days: WellnessDay[] }) {
  const colors = {
    critical: STATUS.critical.dark,
    warning: STATUS.warning.dark,
    good: STATUS.good.dark,
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

  const { label: statusLabel, color: statusColor } = classify(value, balancedLow, balancedUpper);
  const fillPercent = Math.round((Math.min(max, Math.max(min, value)) - min) / (max - min) * 100);

  return (
    <div className="flex flex-col items-center">
      <Gauge
        value={fillPercent}
        centerValue={Math.round(value)}
        suffix=" ms"
        defaultLabel={statusLabel}
        activeFill={statusColor}
        totalNotches={32}
      />
      <p className="mt-1 text-xs text-ink-muted">Rango balanceado: {balancedLow}-{balancedUpper} ms</p>
    </div>
  );
}
