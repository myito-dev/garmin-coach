import { z } from "zod";

// Validated shape for a training-plan data file (src/data/plans/*.json).
// A future plan is just a new JSON file that satisfies this schema — see
// src/data/plans/README.md for the authoring guide.

const paceStringSchema = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "El ritmo debe tener el formato m:ss, ej. '6:30'");

const paceFieldSchema = z.object({
  fast: paceStringSchema,
  slow: paceStringSchema,
});

const sessionKindSchema = z.enum([
  "rodaje",
  "fartlek",
  "tempo",
  "intervalos",
  "ritmo_carrera",
  "long_run",
  "activacion",
  "carrera",
  "descanso",
  "fuerza",
]);

const dayLabelSchema = z.enum(["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]);

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe ser ISO, ej. '2026-07-20'");

const plannedSessionSchema = z.object({
  day: dayLabelSchema,
  date: isoDateSchema,
  kind: sessionKindSchema,
  title: z.string(),
  structure: z.string().optional(),
  distanceKm: z.number().positive().optional(),
  pace: paceFieldSchema.optional(),
  shoe: z.string().optional(),
  note: z.string().optional(),
  effort: z.string().optional(),
  garminHint: z.string().optional(),
});

const trainingWeekSchema = z.object({
  weekNumber: z.number().int().positive(),
  label: z.string(),
  dateRangeLabel: z.string(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  phase: z.string(),
  focus: z.string(),
  totalKmLabel: z.string(),
  highlight: z.string().optional(),
  days: z.array(plannedSessionSchema).min(1),
});

const hrZoneSchema = z.object({
  zone: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  label: z.string(),
  min: z.number().int(),
  max: z.number().int().nullable(),
});

const sessionGuideSchema = z.object({
  title: z.string(),
  effort: z.string(),
  steps: z.array(z.string()).min(1),
  garminHint: z.string().optional(),
});

export const trainingPlanFileSchema = z.object({
  id: z.string(),
  race: z.object({
    name: z.string(),
    date: isoDateSchema,
    goalTimeLabel: z.string(),
    goalPace: paceStringSchema,
    city: z.string(),
    distanceKm: z.number().positive(),
  }),
  hrZones: z.array(hrZoneSchema).min(1),
  diagnosis: z.object({
    best10k: z.object({ timeLabel: z.string(), distanceKm: z.number(), paceLabel: z.string(), date: isoDateSchema, note: z.string().optional() }),
    best5k: z.object({ timeLabel: z.string(), paceLabel: z.string() }),
    halfCdmx: z.object({
      distanceKm: z.number(),
      timeLabel: z.string(),
      paceLabel: z.string(),
      avgHR: z.number(),
      maxHR: z.number(),
      relativeEffort: z.number(),
    }),
    riegelPrediction: z.string(),
    cadenceTypicalSpm: z.number(),
    cadenceGoalSpm: z.tuple([z.number(), z.number()]),
    weeklyVolumeBeforePlan: z.string(),
    summary: z.string(),
  }),
  raceStrategy: z.array(z.object({ rangeLabel: z.string(), pace: z.string(), note: z.string() })).min(1),
  strengthSchedule: z.object({
    days: z.array(z.object({ day: z.string(), focus: z.string() })),
    rule: z.string(),
  }),
  shoes: z.record(z.string(), z.string()),
  sessionGuides: z.partialRecord(sessionKindSchema, sessionGuideSchema),
  weeks: z.array(trainingWeekSchema).min(1),
});

export type TrainingPlanFile = z.infer<typeof trainingPlanFileSchema>;
