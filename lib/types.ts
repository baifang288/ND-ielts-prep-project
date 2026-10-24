export type Skill = "listening" | "reading" | "writing" | "speaking";
export type Area = Skill | "grammar" | "vocab" | "review" | "assessment";

export type QuestionKind = "mcq" | "text";

/** Tags used for accuracy-by-question-type analytics. */
export type QType =
  | "mcq"
  | "form-completion"
  | "note-completion"
  | "main-idea"
  | "detail"
  | "tfng"
  | "ynng"
  | "matching-headings"
  | "sentence-completion"
  | "summary-completion"
  | "vocab-in-context"
  | "scanning"
  | "grammar"
  | "vocabulary";

export interface Question {
  id: string;
  kind: QuestionKind;
  qtype: QType;
  prompt: string;
  options?: string[];
  /** Accepted answers. For mcq: the exact option text. For text: any accepted spelling. */
  answer: string[];
  explanationTh: string;
  /** Quote from the passage/script that proves the answer. */
  evidence?: string;
  /** Word limit hint for completion questions, e.g. "ONE WORD AND/OR A NUMBER". */
  limit?: string;
}

export interface VocabSeed {
  en: string;
  th: string;
  example: string;
  ipa?: string;
  topic: string;
  level: "A2" | "B1" | "B2" | "C1";
}

export type MistakeCategory =
  | "verb-tense"
  | "subject-verb-agreement"
  | "articles"
  | "prepositions"
  | "word-form"
  | "sentence-structure"
  | "vocabulary"
  | "collocation"
  | "spelling"
  | "punctuation"
  | "listening-missed-keyword"
  | "listening-accent"
  | "listening-distractor"
  | "listening-numbers"
  | "reading-paraphrase"
  | "reading-tfng"
  | "reading-scanning"
  | "writing-task-response"
  | "writing-coherence"
  | "speaking-fluency"
  | "pronunciation"
  | "other";

export interface Attempt {
  id: string;
  date: string; // ISO timestamp
  source: "lesson" | "listening" | "reading" | "assessment" | "review-quiz" | "mistake-quiz";
  refId: string;
  title: string;
  skill: Area;
  correct: number;
  total: number;
  byType: Partial<Record<QType, { c: number; t: number }>>;
  timeSec?: number;
  timed?: boolean;
}

export interface VocabItem {
  id: string;
  en: string;
  th: string;
  example: string;
  ipa?: string;
  topic: string;
  level: string;
  addedAt: string; // YYYY-MM-DD
  stage: number; // index into SRS_INTERVALS
  dueDate: string; // YYYY-MM-DD
  lastReviewed?: string;
  reviews: { date: string; rating: "easy" | "difficult" | "forgotten" }[];
  source?: string;
}

export interface MistakeItem {
  id: string;
  date: string; // YYYY-MM-DD
  original: string;
  corrected: string;
  explanationTh: string;
  category: MistakeCategory;
  skill: Area;
  source?: string;
  practice?: string; // a similar practice question
  options?: string[]; // when the practice question is multiple choice
  attempts: { date: string; ok: boolean }[];
  resolved: boolean;
}

export interface WritingRevision {
  at: string;
  text: string;
  words: number;
  note?: string;
}

export interface WritingFeedback {
  at: string;
  kind: "ai" | "rule-check";
  model?: string;
  text: string; // markdown-ish text
  forRevisionAt: string;
}

export interface WritingDraft {
  id: string;
  promptId: string;
  task: 1 | 2 | 0; // 0 = paragraph practice
  title: string;
  text: string;
  updatedAt: string;
  revisions: WritingRevision[];
  feedback: WritingFeedback[];
  checklist: Record<string, boolean>;
}

export interface SpeakingSession {
  id: string;
  date: string;
  part: 1 | 2 | 3;
  question: string;
  transcript: string;
  transcriptSource: "speech-recognition" | "typed";
  durationSec: number;
  feedback?: string;
  feedbackKind?: "ai" | "self-check";
  selfCheck?: Record<string, boolean>;
  attemptNo: number;
}

export type MockSource = "official-sample" | "full-practice-test" | "teacher" | "ai-estimate" | "self-assessment";

export interface MockResult {
  id: string;
  date: string; // YYYY-MM-DD
  skill: Skill;
  source: MockSource;
  raw?: number; // out of 40 for listening/reading
  band?: number;
  notes?: string;
}

export interface LessonRecord {
  status: "completed" | "skipped";
  at: string; // ISO
  note?: string;
}

export interface Settings {
  startDate: string; // YYYY-MM-DD
  examDate: string; // YYYY-MM-DD
  dailyMinutes: number;
  planMonths: number; // 9..12
  theme: "system" | "light" | "dark";
  accessCode: string;
  ttsRate: number;
}

export interface TimerState {
  running: boolean;
  startedAt?: number; // epoch ms
  accumulatedSec: number;
  area: Area;
  label: string;
}

export interface AssessmentResult {
  completedAt: string;
  sections: Record<string, { correct: number; total: number }>;
  writingSample: string;
  speakingTranscript: string;
  selfRatings: Record<Skill, number>; // 1-5 confidence
}

export interface AppState {
  version: 1;
  settings: Settings;
  assessment?: AssessmentResult;
  lessons: Record<string, LessonRecord>;
  reschedule: Record<string, string>;
  guided: Record<string, Record<string, string>>; // lessonId -> answers
  attempts: Attempt[];
  studyLog: Record<string, { minutes: number; byArea: Partial<Record<Area, number>> }>;
  timer: TimerState;
  vocab: VocabItem[];
  mistakes: MistakeItem[];
  drafts: WritingDraft[];
  speaking: SpeakingSession[];
  mocks: MockResult[];
  phase: { current: number; advancedAt: Record<string, string> };
  lastLocation?: { href: string; label: string; at: string };
  tutorChat: { role: "user" | "assistant"; content: string }[];
}
