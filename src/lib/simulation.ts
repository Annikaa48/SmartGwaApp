import { Subject } from "../types";

export const GRADE_SCALE = [
  1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0,
];

export function stepGrade(
  currentGrade: number | null | undefined,
  direction: "up" | "down",
): number {
  if (
    currentGrade === null ||
    currentGrade === undefined ||
    isNaN(Number(currentGrade))
  ) {
    return direction === "up" ? 1.0 : 3.0;
  }

  const num = Number(currentGrade);
  const currentIndex = GRADE_SCALE.findIndex((g) => Math.abs(g - num) < 0.01);

  if (currentIndex === -1) {
    // Find closest
    let closestIdx = 0;
    let minDiff = 999;
    GRADE_SCALE.forEach((g, idx) => {
      const diff = Math.abs(g - num);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    if (direction === "up") {
      return closestIdx > 0 ? GRADE_SCALE[closestIdx - 1] : GRADE_SCALE[0];
    } else {
      return closestIdx < GRADE_SCALE.length - 1
        ? GRADE_SCALE[closestIdx + 1]
        : GRADE_SCALE[GRADE_SCALE.length - 1];
    }
  }

  // 1.00 is highest. "up" improves grade toward 1.00.
  if (direction === "up") {
    return currentIndex > 0 ? GRADE_SCALE[currentIndex - 1] : GRADE_SCALE[0];
  } else {
    return currentIndex < GRADE_SCALE.length - 1
      ? GRADE_SCALE[currentIndex + 1]
      : GRADE_SCALE[GRADE_SCALE.length - 1];
  }
}

export type TargetRequirementResult = {
  targetGwa: number;
  currentGwa: number | null;
  currentUnits: number;
  remainingUnits: number;
  isAchieved: boolean;
  isImpossible: boolean;
  requiredAverage: number | null;
  message: string;
};

export function calculateTargetRequirement(
  subjects: readonly Subject[],
  remainingUnits: number,
  targetGwa: number,
): TargetRequirementResult {
  // Only consider subjects included in GWA that have a valid numeric grade
  const validSubjects = subjects.filter(
    (s) =>
      s.is_included_in_gwa &&
      s.grade !== null &&
      s.grade !== undefined &&
      !isNaN(Number(s.grade)),
  );

  const currentUnits = validSubjects.reduce((acc, s) => acc + (Number(s.units) || 0), 0);
  const currentPoints = validSubjects.reduce(
    (acc, s) => acc + (Number(s.units) || 0) * Number(s.grade),
    0,
  );

  const currentGwa = currentUnits > 0 ? currentPoints / currentUnits : null;

  if (remainingUnits <= 0) {
    const isAchieved = currentGwa !== null && currentGwa <= targetGwa;
    return {
      targetGwa,
      currentGwa,
      currentUnits,
      remainingUnits: 0,
      isAchieved,
      isImpossible: !isAchieved && currentGwa !== null && currentGwa > targetGwa,
      requiredAverage: null,
      message: isAchieved
        ? "Target already achieved!"
        : "Set remaining units to calculate needed grades.",
    };
  }

  const totalUnits = currentUnits + remainingUnits;
  const maxAllowedPoints = targetGwa * totalUnits;
  const neededPoints = maxAllowedPoints - currentPoints;
  const rawRequiredAvg = neededPoints / remainingUnits;

  // In Philippine scale, 1.00 is the highest grade possible.
  // If needed grade < 1.00 (e.g. 0.95), it is mathematically impossible.
  if (rawRequiredAvg < 1.0) {
    return {
      targetGwa,
      currentGwa,
      currentUnits,
      remainingUnits,
      isAchieved: false,
      isImpossible: true,
      requiredAverage: Math.round(rawRequiredAvg * 100) / 100,
      message: `Mathematically impossible (requires ${rawRequiredAvg.toFixed(2)}, but 1.00 is the highest possible grade).`,
    };
  }

  const requiredAverage = Math.round(rawRequiredAvg * 100) / 100;
  const isAchieved = currentGwa !== null && currentGwa <= targetGwa;

  return {
    targetGwa,
    currentGwa,
    currentUnits,
    remainingUnits,
    isAchieved,
    isImpossible: false,
    requiredAverage,
    message:
      requiredAverage > 3.0
        ? `Passing average of 3.00 or better will easily achieve this target.`
        : `Requires an average grade of ${requiredAverage.toFixed(2)} or better across your remaining ${remainingUnits} units.`,
  };
}

export type StandingTarget = {
  standingName: "President's List" | "Dean's List" | "Custom Target";
  targetGwa: number;
  isAchieved: boolean;
  isPossible: boolean;
  requiredAverage?: number;
};

export function calculateRequiredGrades(
  subjects: readonly Subject[],
  hypotheticalUnits: number = 0,
): StandingTarget[] {
  const pResult = calculateTargetRequirement(subjects, hypotheticalUnits, 1.25);
  const dResult = calculateTargetRequirement(subjects, hypotheticalUnits, 1.5);

  return [
    {
      standingName: "President's List",
      targetGwa: 1.25,
      isAchieved: pResult.isAchieved,
      isPossible: !pResult.isImpossible,
      requiredAverage:
        !pResult.isImpossible && pResult.requiredAverage !== null
          ? pResult.requiredAverage
          : undefined,
    },
    {
      standingName: "Dean's List",
      targetGwa: 1.5,
      isAchieved: dResult.isAchieved,
      isPossible: !dResult.isImpossible,
      requiredAverage:
        !dResult.isImpossible && dResult.requiredAverage !== null
          ? dResult.requiredAverage
          : undefined,
    },
  ];
}
