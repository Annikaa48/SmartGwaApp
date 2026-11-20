export const YEAR_LABELS = ["1st", "2nd", "3rd", "4th", "5th"] as const;
export const TERM_LABELS = ["1st Semester", "2nd Semester", "Summer"] as const;

type ParsedTerm = { yearIndex: number; termIndex: number };

export function buildTermName(yearIndex: number, termIndex: number): string {
  return `${YEAR_LABELS[yearIndex]} Year - ${TERM_LABELS[termIndex]}`;
}

export function parseTermName(name: string): ParsedTerm | null {
  const wanted = name.trim().toLowerCase();
  for (let yearIndex = 0; yearIndex < YEAR_LABELS.length; yearIndex += 1) {
    for (let termIndex = 0; termIndex < TERM_LABELS.length; termIndex += 1) {
      if (buildTermName(yearIndex, termIndex).toLowerCase() === wanted) {
        return { yearIndex, termIndex };
      }
    }
  }
  return null;
}

/** Standard names sort chronologically; custom names go last. */
export function termSortValue(name: string): number {
  const parsed = parseTermName(name);
  return parsed
    ? parsed.yearIndex * 10 + parsed.termIndex
    : Number.MAX_SAFE_INTEGER;
}

/** Suggests the semester that normally follows the latest standard one. */
export function suggestNextTerm(existingNames: readonly string[]): string {
  let latest: ParsedTerm | null = null;
  let latestValue = -1;

  for (const name of existingNames) {
    const parsed = parseTermName(name);
    if (!parsed) continue;
    const value = parsed.yearIndex * 10 + parsed.termIndex;
    if (value > latestValue) {
      latest = parsed;
      latestValue = value;
    }
  }

  if (!latest) return buildTermName(0, 0);
  if (latest.termIndex === 0) return buildTermName(latest.yearIndex, 1);
  return buildTermName(
    Math.min(latest.yearIndex + 1, YEAR_LABELS.length - 1),
    0,
  );
}
