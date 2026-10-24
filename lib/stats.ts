import type { AppState, Area, Attempt, QType, Skill } from "./types";
import { LESSONS, type Lesson } from "@/data/lessons";
import { addDays, daysBetween, startOfWeek, today } from "./dates";
import { isLearned } from "./srs";

export const SKILLS: Skill[] = ["listening", "reading", "writing", "speaking"];

export const AREA_LABEL: Record<Area, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  grammar: "Grammar",
  vocab: "Vocabulary",
  review: "ทบทวน",
  assessment: "แบบประเมิน",
};

export const QTYPE_LABEL: Record<QType, string> = {
  mcq: "Multiple choice",
  "form-completion": "Form completion",
  "note-completion": "Note completion",
  "main-idea": "Main idea",
  detail: "Detail",
  tfng: "True/False/Not Given",
  ynng: "Yes/No/Not Given",
  "matching-headings": "Matching headings",
  "sentence-completion": "Sentence completion",
  "summary-completion": "Summary completion",
  "vocab-in-context": "Vocabulary in context",
  scanning: "Scanning",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
};

// ── Schedule ────────────────────────────────────────────────────────────────

export function lessonDate(s: AppState, l: Lesson): string {
  return s.reschedule[l.id] ?? addDays(s.settings.startDate, l.day - 1);
}

export function lessonStatus(s: AppState, l: Lesson): "completed" | "skipped" | "overdue" | "today" | "upcoming" {
  const rec = s.lessons[l.id];
  if (rec) return rec.status;
  const d = lessonDate(s, l);
  const t = today();
  if (d < t) return "overdue";
  if (d === t) return "today";
  return "upcoming";
}

export function sortedLessons(s: AppState): Lesson[] {
  return [...LESSONS].sort((a, b) => lessonDate(s, a).localeCompare(lessonDate(s, b)) || a.day - b.day);
}

/**
 * Today's lesson = the earliest lesson that is not done/skipped and is due today or earlier.
 * Before the start date (or when everything due is done) it is the next open lesson, so the
 * learner can always start early.
 */
export function todaysLesson(s: AppState): { lesson: Lesson | undefined; early: boolean } {
  const open = sortedLessons(s).filter((l) => !s.lessons[l.id]);
  const t = today();
  const due = open.find((l) => lessonDate(s, l) <= t);
  if (due) return { lesson: due, early: false };
  return { lesson: open[0], early: !!open[0] };
}

export function weekCompletion(s: AppState, ref = today()): { done: number; total: number; pct: number } {
  const start = startOfWeek(ref);
  const end = addDays(start, 6);
  const inWeek = LESSONS.filter((l) => {
    const d = lessonDate(s, l);
    return d >= start && d <= end;
  });
  const done = inWeek.filter((l) => s.lessons[l.id]?.status === "completed").length;
  return { done, total: inWeek.length, pct: inWeek.length ? Math.round((done / inWeek.length) * 100) : 0 };
}

// ── Study time & streak ─────────────────────────────────────────────────────

/** A day counts towards the streak if the learner studied (timer) or completed something. */
export function activeDays(s: AppState): Set<string> {
  const days = new Set<string>();
  for (const [d, v] of Object.entries(s.studyLog)) if (v.minutes > 0) days.add(d);
  for (const rec of Object.values(s.lessons)) if (rec.status === "completed") days.add(rec.at.slice(0, 10));
  for (const a of s.attempts) days.add(a.date.slice(0, 10));
  for (const v of s.vocab) for (const r of v.reviews) days.add(r.date);
  for (const sp of s.speaking) days.add(sp.date.slice(0, 10));
  return days;
}

export function streak(s: AppState): number {
  const days = activeDays(s);
  let d = today();
  // If nothing yet today, the streak is still alive from yesterday.
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function totalMinutes(s: AppState): number {
  return Object.values(s.studyLog).reduce((a, v) => a + v.minutes, 0);
}

export function minutesByArea(s: AppState): Partial<Record<Area, number>> {
  const out: Partial<Record<Area, number>> = {};
  for (const v of Object.values(s.studyLog)) for (const [k, m] of Object.entries(v.byArea)) out[k as Area] = (out[k as Area] ?? 0) + (m ?? 0);
  return out;
}

export function minutesToday(s: AppState): number {
  return s.studyLog[today()]?.minutes ?? 0;
}

// ── Accuracy ───────────────────────────────────────────────────────────────

export function attemptsFor(s: AppState, skill: Area): Attempt[] {
  return s.attempts.filter((a) => a.skill === skill);
}

export function accuracy(list: Attempt[]): number | null {
  const t = list.reduce((a, x) => a + x.total, 0);
  if (!t) return null;
  return Math.round((list.reduce((a, x) => a + x.correct, 0) / t) * 100);
}

export function recentAccuracy(s: AppState, skill: Area, n = 5): number | null {
  return accuracy(attemptsFor(s, skill).filter((a) => a.source !== "assessment" && a.source !== "mistake-quiz").slice(-n));
}

export function accuracyByType(s: AppState, skill?: Area): { qtype: QType; c: number; t: number; pct: number }[] {
  const agg: Partial<Record<QType, { c: number; t: number }>> = {};
  for (const a of s.attempts) {
    if (skill && a.skill !== skill) continue;
    if (a.source === "mistake-quiz") continue; // re-tries of known answers would inflate accuracy
    for (const [k, v] of Object.entries(a.byType)) {
      const x = (agg[k as QType] ??= { c: 0, t: 0 });
      x.c += v!.c;
      x.t += v!.t;
    }
  }
  return Object.entries(agg)
    .map(([qtype, v]) => ({ qtype: qtype as QType, c: v!.c, t: v!.t, pct: Math.round((v!.c / v!.t) * 100) }))
    .sort((a, b) => a.pct - b.pct);
}

export function lessonsCompleted(s: AppState, area?: Area): number {
  return LESSONS.filter((l) => s.lessons[l.id]?.status === "completed" && (!area || l.area === area)).length;
}

export function lessonsTotal(area?: Area): number {
  return LESSONS.filter((l) => !area || l.area === area).length;
}

// ── Vocabulary ─────────────────────────────────────────────────────────────

export function vocabStats(s: AppState) {
  const t = today();
  const reviews = s.vocab.flatMap((v) => v.reviews);
  const recalled = reviews.filter((r) => r.rating !== "forgotten").length;
  return {
    total: s.vocab.length,
    due: s.vocab.filter((v) => v.dueDate <= t).length,
    learned: s.vocab.filter((v) => isLearned(v.stage)).length,
    reviewed: s.vocab.filter((v) => v.reviews.length > 0).length,
    reviewCount: reviews.length,
    retention: reviews.length ? Math.round((recalled / reviews.length) * 100) : null,
  };
}

// ── Mistakes ───────────────────────────────────────────────────────────────

export function openMistakeCategories(s: AppState): { category: string; count: number }[] {
  const m: Record<string, number> = {};
  for (const x of s.mistakes) if (!x.resolved) m[x.category] = (m[x.category] ?? 0) + 1;
  return Object.entries(m)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Skill summary & recommendations ────────────────────────────────────────

export interface SkillSummary {
  skill: Skill;
  minutes: number;
  lessonsDone: number;
  lessonsTotal: number;
  accuracy: number | null; // listening/reading only
  activityCount: number; // attempts, drafts with revisions, or speaking sessions
}

export function skillSummary(s: AppState, skill: Skill): SkillSummary {
  const minutes = minutesByArea(s)[skill] ?? 0;
  let activityCount = 0;
  if (skill === "listening" || skill === "reading") activityCount = attemptsFor(s, skill).length;
  if (skill === "writing") activityCount = s.drafts.reduce((a, d) => a + d.revisions.length, 0);
  if (skill === "speaking") activityCount = s.speaking.length;
  return {
    skill,
    minutes,
    lessonsDone: lessonsCompleted(s, skill),
    lessonsTotal: lessonsTotal(skill),
    accuracy: skill === "listening" || skill === "reading" ? recentAccuracy(s, skill) : null,
    activityCount,
  };
}

const SKILL_HREF: Record<Skill, string> = { listening: "/listening", reading: "/reading", writing: "/writing", speaking: "/speaking" };

/**
 * Rule-based next-activity recommendation (works without AI).
 * Priority: assessment → due vocab backlog → weakest measured skill → least-practised skill.
 */
export function recommendNext(s: AppState): { th: string; href: string; reasonTh: string } {
  if (!s.assessment) return { th: "ทำแบบประเมินเริ่มต้น", href: "/assessment", reasonTh: "ยังไม่มีข้อมูลจุดเริ่มต้น แผนจะปรับได้แม่นยำขึ้นหลังทำแบบประเมิน" };
  const v = vocabStats(s);
  if (v.due >= 15) return { th: `ทบทวนคำศัพท์ที่ถึงกำหนด ${v.due} คำ`, href: "/vocabulary?review=1", reasonTh: "คำศัพท์ค้างทบทวนเยอะ ถ้าปล่อยไว้จะลืมเร็ว" };
  const openMistakes = s.mistakes.filter((m) => !m.resolved).length;
  if (openMistakes >= 10) return { th: "ฝึกจากสมุดข้อผิดพลาด", href: "/mistakes?practice=1", reasonTh: `มีข้อผิดพลาดที่ยังไม่แก้ ${openMistakes} ข้อ` };

  const lr = (["listening", "reading"] as const)
    .map((k) => ({ k, acc: recentAccuracy(s, k) }))
    .filter((x) => x.acc !== null)
    .sort((a, b) => a.acc! - b.acc!);
  if (lr[0] && lr[0].acc! < 60) {
    return { th: `ฝึก ${AREA_LABEL[lr[0].k]} เพิ่ม`, href: SKILL_HREF[lr[0].k], reasonTh: `ความแม่นยำ 5 ครั้งล่าสุด ${lr[0].acc}% ต่ำกว่า 60%` };
  }
  const least = SKILLS.map((k) => skillSummary(s, k)).sort((a, b) => a.activityCount - b.activityCount || a.minutes - b.minutes)[0];
  return { th: `ฝึก ${AREA_LABEL[least.skill]}`, href: SKILL_HREF[least.skill], reasonTh: "เป็นทักษะที่ฝึกน้อยที่สุดจนถึงตอนนี้ (ต้องฝึกให้สมดุลทั้ง 4 ทักษะ)" };
}

// ── Phase readiness (Phase 1 → 2 is measured; later phases use the same signals) ──

export interface Criterion {
  label: string;
  met: boolean;
  detail: string;
}

export function phaseCriteria(s: AppState, phase: number): Criterion[] {
  const lessonsDone = lessonsCompleted(s);
  const lessonPct = Math.round((lessonsDone / LESSONS.length) * 100);
  const lAcc = recentAccuracy(s, "listening");
  const rAcc = recentAccuracy(s, "reading");
  const paragraphs = s.drafts.filter((d) => d.revisions.length > 0).length;
  const speaking = s.speaking.length;
  const resolvedPct = s.mistakes.length ? Math.round((s.mistakes.filter((m) => m.resolved).length / s.mistakes.length) * 100) : 0;
  const fullTests = (skill: Skill) => s.mocks.filter((m) => m.skill === skill && m.source === "full-practice-test");

  if (phase === 1) {
    return [
      { label: "บทเรียน 4 สัปดาห์แรกเสร็จ ≥ 80%", met: lessonPct >= 80, detail: `${lessonsDone}/${LESSONS.length} (${lessonPct}%)` },
      { label: "Listening 5 ครั้งล่าสุด ≥ 60%", met: (lAcc ?? 0) >= 60, detail: lAcc === null ? "ยังไม่มีข้อมูล" : `${lAcc}%` },
      { label: "Reading 5 ครั้งล่าสุด ≥ 60%", met: (rAcc ?? 0) >= 60, detail: rAcc === null ? "ยังไม่มีข้อมูล" : `${rAcc}%` },
      { label: "คำศัพท์ในสมุด ≥ 100 คำ", met: s.vocab.length >= 100, detail: `${s.vocab.length} คำ` },
      { label: "งานเขียน ≥ 4 ชิ้น", met: paragraphs >= 4, detail: `${paragraphs} ชิ้น` },
      { label: "ฝึกพูด ≥ 8 ครั้ง", met: speaking >= 8, detail: `${speaking} ครั้ง` },
    ];
  }
  if (phase === 2) {
    return [
      { label: "Listening 5 ครั้งล่าสุด ≥ 65%", met: (lAcc ?? 0) >= 65, detail: lAcc === null ? "ยังไม่มีข้อมูล" : `${lAcc}%` },
      { label: "Reading 5 ครั้งล่าสุด ≥ 65%", met: (rAcc ?? 0) >= 65, detail: rAcc === null ? "ยังไม่มีข้อมูล" : `${rAcc}%` },
      { label: "ร่างงานเขียนที่มีการแก้ไข ≥ 4 ชิ้น", met: s.drafts.filter((d) => d.revisions.length >= 2).length >= 4, detail: `${s.drafts.filter((d) => d.revisions.length >= 2).length} ชิ้น` },
      { label: "ข้อผิดพลาดแก้สำเร็จ ≥ 50%", met: resolvedPct >= 50, detail: `${resolvedPct}%` },
    ];
  }
  if (phase === 3) {
    const types = accuracyByType(s).filter((x) => x.t >= 3);
    const weak = types.filter((x) => x.pct < 60);
    const t1 = new Set(s.drafts.filter((d) => d.task === 1 && d.revisions.length).map((d) => d.promptId)).size;
    const t2 = new Set(s.drafts.filter((d) => d.task === 2 && d.revisions.length).map((d) => d.promptId)).size;
    const p2 = s.speaking.filter((x) => x.part === 2 && x.durationSec >= 100).length;
    return [
      { label: "ทุกประเภทคำถามที่ทำ ≥ 3 ข้อ แม่นยำ ≥ 60%", met: types.length >= 8 && weak.length === 0, detail: weak.length ? `ยังต่ำ: ${weak.map((w) => QTYPE_LABEL[w.qtype]).join(", ")}` : `${types.length} ประเภท` },
      { label: "Task 1 ครบ 5 ประเภทภาพ", met: t1 >= 5, detail: `${t1}/5` },
      { label: "Task 2 ครบ 4 ประเภท", met: t2 >= 4, detail: `${t2}/4` },
      { label: "Part 2 พูด ≥ 1:40 นาที อย่างน้อย 5 ครั้ง", met: p2 >= 5, detail: `${p2} ครั้ง` },
    ];
  }
  if (phase === 4) {
    const ok = (skill: Skill) => fullTests(skill).filter((m) => (m.raw ?? 0) >= 23).length;
    return [
      { label: "Listening แบบเต็ม ≥ 23/40 อย่างน้อย 2 ครั้ง", met: ok("listening") >= 2, detail: `${ok("listening")} ครั้ง` },
      { label: "Reading แบบเต็ม ≥ 23/40 อย่างน้อย 2 ครั้ง", met: ok("reading") >= 2, detail: `${ok("reading")} ครั้ง` },
    ];
  }
  const last3 = (skill: Skill) => fullTests(skill).slice(-3);
  const consistent = (skill: Skill) => last3(skill).length === 3 && last3(skill).every((m) => (m.raw ?? 0) >= 26);
  return [
    { label: "Listening แบบเต็ม 3 ครั้งล่าสุด ≥ 26/40", met: consistent("listening"), detail: last3("listening").map((m) => m.raw).join(", ") || "ยังไม่มีข้อมูล" },
    { label: "Reading แบบเต็ม 3 ครั้งล่าสุด ≥ 27/40", met: last3("reading").length === 3 && last3("reading").every((m) => (m.raw ?? 0) >= 27), detail: last3("reading").map((m) => m.raw).join(", ") || "ยังไม่มีข้อมูล" },
  ];
}

export function daysUntil(iso: string): number {
  return daysBetween(today(), iso);
}
