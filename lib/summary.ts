import type { AppState } from "./types";
import { AREA_LABEL, QTYPE_LABEL, SKILLS, accuracyByType, lessonsCompleted, lessonsTotal, minutesByArea, openMistakeCategories, recentAccuracy, streak, vocabStats } from "./stats";
import { addDays, today } from "./dates";
import { MISTAKE_LABEL } from "./labels";
import { PHASES } from "@/data/roadmap";

/** Plain-text progress summary shared with the AI tutor (no personal data beyond study stats). */
export function progressSummary(s: AppState): string {
  const t = today();
  const weekAgo = addDays(t, -6);
  let weekMin = 0;
  for (const [d, v] of Object.entries(s.studyLog)) if (d >= weekAgo && d <= t) weekMin += v.minutes;
  const byArea = minutesByArea(s);
  const v = vocabStats(s);
  const weakTypes = accuracyByType(s).filter((x) => x.t >= 3).slice(0, 3);
  const cats = openMistakeCategories(s).slice(0, 4);
  const recentMistakes = s.mistakes.filter((m) => !m.resolved).slice(0, 8);
  return [
    `Today: ${t}. Study start: ${s.settings.startDate}. Target exam: ${s.settings.examDate}. Current phase: ${s.phase.current} (${PHASES[s.phase.current - 1].title}).`,
    `Initial assessment: ${s.assessment ? Object.entries(s.assessment.sections).map(([k, x]) => `${k} ${x.correct}/${x.total}`).join(", ") : "not done yet"}.`,
    `Lessons completed: ${lessonsCompleted(s)}/${lessonsTotal()}. Streak: ${streak(s)} days. Minutes in last 7 days: ${weekMin} (goal ${s.settings.dailyMinutes * 7}).`,
    `Minutes by area (all time): ${Object.entries(byArea).map(([a, m]) => `${AREA_LABEL[a as keyof typeof AREA_LABEL]} ${m}`).join(", ") || "none"}.`,
    `Recent accuracy (last 5 short practice exercises, not band scores): ${SKILLS.filter((k) => k === "listening" || k === "reading").map((k) => `${k} ${recentAccuracy(s, k) ?? "no data"}%`).join(", ")}.`,
    `Weakest question types: ${weakTypes.map((x) => `${QTYPE_LABEL[x.qtype]} ${x.pct}% (${x.c}/${x.t})`).join(", ") || "not enough data"}.`,
    `Writing: ${s.drafts.length} pieces, ${s.drafts.reduce((a, d) => a + d.revisions.length, 0)} revisions. Speaking sessions: ${s.speaking.length}.`,
    `Vocabulary: ${v.total} words, ${v.due} due, retention ${v.retention ?? "no data"}%.`,
    `Open mistake categories: ${cats.map((c) => `${MISTAKE_LABEL[c.category] ?? c.category} ×${c.count}`).join(", ") || "none"}.`,
    recentMistakes.length ? `Recent open mistakes:\n${recentMistakes.map((m) => `- "${m.original.split("\n")[0].slice(0, 120)}" → "${m.corrected}" [${m.category}]`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
}
