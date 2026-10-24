/** Answer normalisation and comparison for auto-checked questions. */

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.,!?;:"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export type CheckResult = "correct" | "spelling" | "wrong" | "blank";

/**
 * Exact match after normalisation counts as correct (IELTS marks misspellings wrong,
 * so a near miss is reported separately as "spelling" and scored as incorrect).
 */
export function checkAnswer(given: string, accepted: string[]): CheckResult {
  const g = normalize(given ?? "");
  if (!g) return "blank";
  const acc = accepted.map(normalize);
  if (acc.includes(g)) return "correct";
  // allow an optional leading article ("the library" vs "library")
  const stripped = g.replace(/^(the|a|an) /, "");
  if (acc.some((a) => a.replace(/^(the|a|an) /, "") === stripped)) return "correct";
  const close = acc.some((a) => a.length > 3 && levenshtein(a, g) <= (a.length > 7 ? 2 : 1));
  return close ? "spelling" : "wrong";
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}
