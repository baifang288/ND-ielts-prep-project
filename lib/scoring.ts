/**
 * Approximate raw-score → band guidance for FULL-LENGTH (40-question) IELTS Listening and
 * Academic Reading tests. The whole-band anchors (16/15→5, 23→6, 30→7, 35→8) are the averages
 * published on ielts.org ("IELTS scoring in detail"); the half-bands in between follow commonly
 * used practice-test tables. Cut-offs vary slightly between test versions.
 * Never apply this to short exercises.
 */
const LISTENING: [number, number][] = [
  [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4],
];
const ACADEMIC_READING: [number, number][] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4],
];

export function approxBandFromRaw(skill: "listening" | "reading", raw: number): number | null {
  if (!Number.isFinite(raw) || raw < 0 || raw > 40) return null;
  const table = skill === "listening" ? LISTENING : ACADEMIC_READING;
  for (const [min, band] of table) if (raw >= min) return band;
  return null; // below 10/40: guidance not shown
}

/** Raw score needed (approximately) for a target band on a full test. */
export function rawNeededFor(skill: "listening" | "reading", band: number): number | null {
  const table = skill === "listening" ? LISTENING : ACADEMIC_READING;
  const row = [...table].reverse().find(([, b]) => b >= band);
  return row ? row[0] : null;
}

/** Overall band = mean of four skills rounded to nearest 0.5 (.25 → up to .5, .75 → up to next whole). */
export function overallBand(bands: number[]): number | null {
  if (bands.length !== 4 || bands.some((b) => !Number.isFinite(b))) return null;
  const mean = bands.reduce((a, b) => a + b, 0) / 4;
  return Math.floor(mean * 2 + 0.5) / 2;
}
