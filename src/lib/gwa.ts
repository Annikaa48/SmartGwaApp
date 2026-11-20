import {
  PASSING_GRADE_MAX,
  StandingKey,
} from "../constants/grading";
import type { SemesterWithSubjects, Subject } from "../types/database";

export type GwaSummary = {
  /** Semester/overall GWA, or null when no units are counted yet. */
  gwa: number | null;
  /** Units of subjects included in the GWA that have a grade. */
  countedUnits: number;
  /** Units of every subject, included or not. */
  totalUnits: number;
  /** Units of subjects with a passing grade (any subject, included or not). */
  earnedUnits: number;
  subjectCount: number;
  /** Graded subject count that is included in GWA */
  gradedSubjectCount: number;
  /** True when a subject counted in the GWA has a failing grade (> 3.00). */
  hasFailingGrade: boolean;
};

export function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * GWA = sum(grade x units) / sum(units), over subjects included in GWA that have a valid grade.
 * - Ungraded subjects (grade === null or undefined) are ignored in GWA calculation until graded.
 * - Excluded subjects (is_included_in_gwa === false) are ignored in GWA calculation.
 */
export function summarizeSubjects(subjects: readonly Subject[]): GwaSummary {
  let weightedPoints = 0;
  let countedUnits = 0;
  let totalUnits = 0;
  let earnedUnits = 0;
  let gradedSubjectCount = 0;
  let hasFailingGrade = false;

  for (const subject of subjects) {
    const units = Number(subject.units) || 0;
    totalUnits += units;

    const rawGrade = subject.grade;
    const isGraded =
      rawGrade !== null &&
      rawGrade !== undefined &&
      rawGrade !== ("" as any) &&
      !isNaN(Number(rawGrade));

    if (isGraded) {
      const numGrade = Number(rawGrade);
      const passed = numGrade <= PASSING_GRADE_MAX;

      if (passed) {
        earnedUnits += units;
      }

      if (subject.is_included_in_gwa) {
        weightedPoints += numGrade * units;
        countedUnits += units;
        gradedSubjectCount += 1;
        if (!passed) {
          hasFailingGrade = true;
        }
      }
    }
  }

  const gwa = countedUnits > 0 ? weightedPoints / countedUnits : null;

  return {
    gwa,
    countedUnits,
    totalUnits,
    earnedUnits,
    subjectCount: subjects.length,
    gradedSubjectCount,
    hasFailingGrade,
  };
}

/** Cumulative GWA across every semester (weighted by units, not an average of averages). */
export function summarizeSemesters(
  semesters: readonly SemesterWithSubjects[],
): GwaSummary {
  return summarizeSubjects(
    semesters.flatMap((semester) => semester.subjects || []),
  );
}

/**
 * Automatically classifies Cumulative/Semester GWA into an Academic Standing:
 * - 1.00 – 1.25: President's List
 * - 1.26 – 1.50: Dean's List
 * - 1.51 – 3.00: Good Standing / Regular
 * - > 3.00: Needs Improvement / Probation
 * - 0 graded subjects: In Progress
 */
export function getStanding(summary: GwaSummary): StandingKey {
  if (summary.gwa === null || summary.countedUnits === 0) {
    return "in_progress";
  }

  const rounded = roundTo2(summary.gwa);

  // If a student has a failing grade in any GWA-counted subject, they cannot qualify for honors
  if (summary.hasFailingGrade) {
    return rounded > 3.0 ? "probation" : "regular";
  }

  if (rounded <= 1.25) return "presidents";
  if (rounded <= 1.5) return "deans";
  if (rounded <= 3.0) return "regular";
  return "probation";
}

export function formatGwa(gwa: number | null): string {
  return gwa === null ? "—" : roundTo2(gwa).toFixed(2);
}

export function formatGrade(grade: number | null | undefined): string {
  if (
    grade === null ||
    grade === undefined ||
    grade === ("" as any) ||
    isNaN(Number(grade))
  ) {
    return "In Progress";
  }
  return Number(grade).toFixed(2);
}

export function formatUnits(units: number): string {
  return String(Number((units || 0).toFixed(2)));
}
