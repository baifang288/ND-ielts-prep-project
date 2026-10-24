import type { AppState, Area, Attempt, MistakeCategory, MistakeItem, QType, Question, VocabSeed } from "./types";
import { addDays, today } from "./dates";
import { nextReview, type Rating } from "./srs";
import { uid } from "./store";
import { checkAnswer, type CheckResult } from "./check";

export function logStudy(d: AppState, minutes: number, area: Area, date = today()) {
  if (!(minutes > 0)) return;
  const day = (d.studyLog[date] ??= { minutes: 0, byArea: {} });
  day.minutes += minutes;
  day.byArea[area] = (day.byArea[area] ?? 0) + minutes;
}

export interface GradedQuestion {
  q: Question;
  given: string;
  result: CheckResult;
}

export function grade(questions: Question[], answers: Record<string, string>): GradedQuestion[] {
  return questions.map((q) => ({ q, given: answers[q.id] ?? "", result: checkAnswer(answers[q.id] ?? "", q.answer) }));
}

export function recordAttempt(
  d: AppState,
  graded: GradedQuestion[],
  meta: Omit<Attempt, "id" | "date" | "correct" | "total" | "byType">,
): Attempt {
  const byType: Attempt["byType"] = {};
  for (const g of graded) {
    const t = (byType[g.q.qtype] ??= { c: 0, t: 0 });
    t.t++;
    if (g.result === "correct") t.c++;
  }
  const a: Attempt = {
    id: uid("a"),
    date: new Date().toISOString(),
    correct: graded.filter((g) => g.result === "correct").length,
    total: graded.length,
    byType,
    ...meta,
  };
  d.attempts.push(a);
  return a;
}

const QTYPE_CATEGORY: Partial<Record<QType, MistakeCategory>> = {
  tfng: "reading-tfng",
  ynng: "reading-tfng",
  "matching-headings": "reading-paraphrase",
  "main-idea": "reading-paraphrase",
  scanning: "reading-scanning",
  "vocab-in-context": "vocabulary",
  vocabulary: "vocabulary",
  grammar: "sentence-structure",
};

/** Wrong answers become mistake-notebook entries so they come back in review quizzes. */
export function mistakesFromGraded(
  d: AppState,
  graded: GradedQuestion[],
  skill: Area,
  source: string,
  categoryFor?: (g: GradedQuestion) => MistakeCategory | undefined,
) {
  for (const g of graded) {
    if (g.result === "correct") continue;
    const category =
      categoryFor?.(g) ??
      (g.result === "spelling" ? "spelling" : QTYPE_CATEGORY[g.q.qtype] ?? (skill === "listening" ? "listening-missed-keyword" : "other"));
    addMistake(d, {
      original: `${g.q.prompt}\nคำตอบของฉัน: ${g.given || "(เว้นว่าง)"}`,
      corrected: g.q.answer[0],
      explanationTh: g.q.explanationTh + (g.q.evidence ? `\nหลักฐาน: "${g.q.evidence}"` : ""),
      category,
      skill,
      source,
      practice: g.q.prompt,
      options: g.q.options,
    });
  }
}

export function addMistake(
  d: AppState,
  m: Omit<MistakeItem, "id" | "date" | "attempts" | "resolved"> & { date?: string },
): MistakeItem {
  // Same question answered wrong again: re-open the existing entry instead of duplicating.
  const existing = d.mistakes.find((x) => x.source === m.source && x.corrected === m.corrected && x.practice === m.practice && m.practice);
  if (existing) {
    existing.resolved = false;
    existing.original = m.original;
    existing.attempts.push({ date: today(), ok: false });
    return existing;
  }
  const item: MistakeItem = { id: uid("m"), date: m.date ?? today(), attempts: [], resolved: false, ...m };
  d.mistakes.unshift(item);
  return item;
}

export function hasVocab(d: AppState, en: string): boolean {
  const k = en.trim().toLowerCase();
  return d.vocab.some((v) => v.en.trim().toLowerCase() === k);
}

export function addVocab(d: AppState, v: VocabSeed & { source?: string }): boolean {
  if (!v.en.trim() || hasVocab(d, v.en)) return false;
  const t = today();
  d.vocab.unshift({
    id: uid("v"),
    en: v.en.trim(),
    th: v.th.trim(),
    example: v.example.trim(),
    ipa: v.ipa,
    topic: v.topic,
    level: v.level,
    addedAt: t,
    stage: 0,
    dueDate: addDays(t, 1),
    reviews: [],
    source: v.source,
  });
  return true;
}

export function rateVocab(d: AppState, id: string, rating: Rating) {
  const v = d.vocab.find((x) => x.id === id);
  if (!v) return;
  const t = today();
  const n = nextReview(v.stage, rating);
  v.stage = n.stage;
  v.dueDate = addDays(t, n.days);
  v.lastReviewed = t;
  v.reviews.push({ date: t, rating });
}

export function setLastLocation(d: AppState, href: string, label: string) {
  d.lastLocation = { href, label, at: new Date().toISOString() };
}
