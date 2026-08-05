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

/** HR zone -> color, matching Garmin's own zone color convention (gray, blue,
 * green, orange, red) so it reads the same as the watch/Garmin Connect. */
export const HR_ZONE_COLOR: Record<number, string> = {
  1: "#8e9196",
  2: "#3987e5",
  3: "#1baf7a",
  4: "#f0a020",
  5: "#e5484d",
};
