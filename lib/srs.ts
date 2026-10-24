/** Spaced repetition: review after 1, 3, 7, 14, then 30 days. */
export const SRS_INTERVALS = [1, 3, 7, 14, 30];

export type Rating = "easy" | "difficult" | "forgotten";

/**
 * Returns the new stage and the number of days until the next review.
 * easy → move up one stage; difficult → stay on the stage but see it again soon;
 * forgotten → back to the start.
 */
export function nextReview(stage: number, rating: Rating): { stage: number; days: number } {
  const max = SRS_INTERVALS.length - 1;
  if (rating === "forgotten") return { stage: 0, days: 1 };
  if (rating === "difficult") {
    const s = Math.max(0, Math.min(stage, max));
    return { stage: s, days: Math.max(1, Math.ceil(SRS_INTERVALS[s] / 2)) };
  }
  const s = Math.min(stage + 1, max);
  return { stage: s, days: SRS_INTERVALS[s] };
}

/** An item counts as "learned" once it has been rated easy at the 7-day stage or later. */
export function isLearned(stage: number): boolean {
  return stage >= 3;
}
