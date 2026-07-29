import { CATEGORICAL } from "./chartColors";
import type { SessionKind } from "./types";

export const SESSION_META: Record<SessionKind, { label: string; color: { light: string; dark: string } }> = {
  rodaje: { label: "Rodaje", color: CATEGORICAL.blue },
  fartlek: { label: "Fartlek", color: CATEGORICAL.violet },
  tempo: { label: "Tempo", color: CATEGORICAL.orange },
  intervalos: { label: "Intervalos", color: CATEGORICAL.red },
  ritmo_carrera: { label: "Ritmo de carrera", color: CATEGORICAL.aqua },
  long_run: { label: "Long run", color: CATEGORICAL.green },
  activacion: { label: "Activación", color: CATEGORICAL.yellow },
  carrera: { label: "Carrera", color: CATEGORICAL.red },
  descanso: { label: "Descanso", color: { light: "#898781", dark: "#898781" } },
  fuerza: { label: "Fuerza", color: CATEGORICAL.magenta },
};
