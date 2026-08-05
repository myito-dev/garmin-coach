// Validated palette from the dataviz design system (see references/palette.md).
// Zones are assigned fixed categorical slots (identity, not a generated ramp).

export const CATEGORICAL = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  orange: { light: "#eb6834", dark: "#d95926" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
  yellow: { light: "#eda100", dark: "#c98500" },
  magenta: { light: "#e87ba4", dark: "#d55181" },
  green: { light: "#008300", dark: "#008300" },
  violet: { light: "#4a3aa7", dark: "#9085e9" },
  red: { light: "#e34948", dark: "#e66767" },
};

export const STATUS = {
  good: { light: "#0ca30c", dark: "#0ca30c" },
  warning: { light: "#fab219", dark: "#fab219" },
  serious: { light: "#ec835a", dark: "#ec835a" },
  critical: { light: "#d03b3b", dark: "#e66767" },
};

/** HR zone -> color, as a brand-orange intensity ramp (pale/easy -> deep/max) —
 * zones are an ordered progression, so lightness/saturation alone carries the
 * meaning without needing a rainbow of unrelated hues. */
export const HR_ZONE_COLOR: Record<number, { light: string; dark: string }> = {
  1: { light: "#f5c9a8", dark: "#5c4433" },
  2: { light: "#eda878", dark: "#8a5a35" },
  3: { light: "#e88a54", dark: "#b8622f" },
  4: { light: "#e35a1f", dark: "#e35a1f" },
  5: { light: "#c0431a", dark: "#ff6b35" },
};
