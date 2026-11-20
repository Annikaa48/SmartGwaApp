import { Subject } from "../types";

export function validateSubject(
  subjectCode: string,
  units: number,
  grade: number | null,
  existingSubjects: Subject[],
  currentSubjectId?: string,
): { isValid: boolean; error: string | null } {
  const trimmed = (subjectCode || "").trim();

  if (!trimmed) {
    return { isValid: false, error: "Subject code is required." };
  }

  if (isNaN(units) || units <= 0) {
    return { isValid: false, error: "Units must be greater than 0." };
  }

  if (grade !== null && (isNaN(grade) || grade < 1.0 || grade > 5.0)) {
    return {
      isValid: false,
      error: "Grade must be between 1.00 and 5.00 (or leave blank if in progress).",
    };
  }

  const isDuplicate = existingSubjects.some((sub: any) => {
    const existing = sub.subject_code || sub.code || "";
    return (
      existing.trim().toLowerCase() === trimmed.toLowerCase() &&
      sub.id !== currentSubjectId
    );
  });

  if (isDuplicate) {
    return {
      isValid: false,
      error: "This subject code already exists in this semester.",
    };
  }

  return { isValid: true, error: null };
}
