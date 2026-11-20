export const GRADE_MIN = 1.0;
export const GRADE_MAX = 5.0;

/** A grade above this value counts as failing (in the Philippine scale, 3.00 is passing, > 3.00 is failing/probation). */
export const PASSING_GRADE_MAX = 3.0;

export type StandingKey =
  | "presidents"
  | "deans"
  | "regular"
  | "probation"
  | "in_progress";

export const STANDING_DEFINITIONS = {
  presidents: {
    label: "President's List",
    minGwa: 1.0,
    maxGwa: 1.25,
  },
  deans: {
    label: "Dean's List",
    minGwa: 1.26,
    maxGwa: 1.5,
  },
  regular: {
    label: "Good Standing / Regular",
    minGwa: 1.51,
    maxGwa: 3.0,
  },
  probation: {
    label: "Needs Improvement / Probation",
    minGwa: 3.01,
    maxGwa: 5.0,
  },
  in_progress: {
    label: "In Progress",
  },
} as const;
