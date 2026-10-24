# IELTS Academic Prep — personal study app

A Thai-first web app for one learner preparing for **IELTS Academic** (target Overall 6.5, no skill below 6.0), starting **9 November 2026** with a provisional exam in **August 2027**.

It is a working study tool, not a mockup: lessons, exercises with answer checking, a study timer, spaced-repetition vocabulary, a mistake notebook that feeds back into practice, progress analytics and an optional AI tutor.

## What's inside

| Area | What works |
|---|---|
| Dashboard | Target, countdowns (start date and exam date), today's lesson, 60-minute timer, four skill cards, weekly completion, streak, total time, vocabulary, open mistakes, latest results, "Start today's lesson", "Continue where I left off" |
| Study plan | 28 detailed lessons for weeks 1–4 (9 Nov – 6 Dec 2026), each with objective, duration, Thai explanation, English examples, guided practice, independent practice, checking method, mistake review and status. Mark completed, skip, or reschedule. Outline for weeks 5–8 |
| Roadmap | 5 phases over 9 months, stretchable to 12. Phases advance **only** when measured criteria are met, never just because time passed |
| Initial assessment | Grammar, vocabulary, reading, listening, a writing sample, a speaking sample and self-ratings. Reports accuracy, never a band |
| Listening | 6 original scripts played by the browser's text-to-speech; form/note/sentence completion, multiple choice, main idea; 2 plays (or exam mode: 1); transcript after submitting; line-by-line replay; error reasons (keyword, distractor, numbers, spelling, accent, vocabulary); vocabulary extraction |
| Reading | 6 original passages from B1 to IELTS-style; main idea, detail, skimming/scanning, vocabulary in context, T/F/NG, Y/N/NG, matching headings, sentence and summary completion; evidence for every answer; optional timer; accuracy by question type |
| Writing | 2 paragraph tasks, 5 Task 1 visuals (bar, line, table, process, map), 4 Task 2 essay types. Editor with word count, autosave, revision history, criteria checklist, a rule-based checker (no AI), AI feedback when configured, one-tap saving of corrections into the mistake notebook |
| Speaking | Parts 1, 2 (1-minute prep + 2-minute talk) and 3; microphone recording and playback; speech-to-text where the browser supports it (or type the transcript); self-check; AI feedback from the transcript, which **explicitly does not judge pronunciation**; follow-up question; try again |
| Vocabulary | Word, Thai meaning, example, IPA, topic, level, date, status; spaced repetition at 1 → 3 → 7 → 14 → 30 days with easy/difficult/forgotten; text-to-speech pronunciation |
| Mistake notebook | Wrong answers are added automatically; manual entries too. Practice mode re-asks your own mistakes; two correct answers in a row marks a mistake as fixed |
| Progress | Time per week and skill, lessons, accuracy over time and by question type, vocabulary retention, error frequency, writing revisions, speaking sessions, mock-test log. Raw → band conversion **only** for full 40-question Listening/Reading tests, labelled approximate |
| AI tutor | Grammar, vocabulary, original practice questions, quizzes from your mistakes, next-activity advice, weekly review. Without AI: rule-based recommendation, mistake quiz, a Thai grammar summary, and copy-ready prompts for an external AI assistant |
| Resources | Official IELTS links and free British Council/BBC links, filterable by skill, CEFR level and phase; official vs external clearly labelled |
| Settings | Start/exam dates (validated), daily minutes, plan length, light/dark theme, TTS speed, AI access code, JSON export/import, reset |

All exercises, passages, scripts, prompts and chart data are **original material written for this app**. Nothing is copied from IELTS tests. AI output is always labelled as an unofficial estimate.

## Architecture

- **Next.js 15 (App Router) + React 19 + TypeScript**, plain CSS with light/dark tokens, mobile-first layout.
- **Storage:** the browser's `localStorage` (one JSON document, saved on every change). No account is needed for a single learner. Use **Settings → Export** to back up or move to another device.
- **AI:** one server route, `app/api/ai/route.ts`, using the official Anthropic SDK. The API key exists only on the server, the client never sees it. Optional `APP_ACCESS_CODE` protects the endpoint when the site is public. There is a small per-instance rate limit, input size limits, and Thai error messages.
- **Content** lives in `data/` as typed structures: `lessons.ts`, `listening.ts`, `reading.ts`, `writing.ts`, `speaking.ts`, `assessment.ts`, `roadmap.ts`, `resources.ts`.
- **Logic** lives in `lib/`: `stats.ts` (schedule, streaks, accuracy, phase criteria, recommendations), `srs.ts`, `check.ts` (answer matching, spelling near-miss), `scoring.ts` (approximate band guidance), `writing-checks.ts` and `ai-prompts.ts`.

## Run it locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start            # add -- -p 3100 to change the port
```

### Turn on AI feedback (optional)

```bash
cp .env.example .env.local
# edit .env.local:
#   ANTHROPIC_API_KEY=sk-ant-...      (from console.anthropic.com; usage is billed)
#   APP_ACCESS_CODE=choose-a-code     (strongly recommended on a public URL)
#   AI_MODEL=                         (optional; default claude-opus-5-5)
```

Restart the server. **Settings** shows whether AI is ready. If you set an access code, enter it once in Settings.
Never put the key in a `NEXT_PUBLIC_` variable.

## Deploy so you can open it on your phone

**Vercel** is the simplest:

1. Push this folder to a GitHub repository.
2. On vercel.com, choose **Add New → Project**, import the repo, and keep the defaults (it detects Next.js).
3. Optional AI: under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` and `APP_ACCESS_CODE`, then redeploy.
4. Open the URL on your phone. In Safari or Chrome, use **Add to Home Screen** for an app-like icon.

Any Node host works the same way with `npm run build && npm start`.

Your study data stays in the browser on each device. Export on one device and import on another to move it.

## Tests

```bash
npm test                         # unit tests: answer checking, SRS, dates, band rounding
npm run build && npm start -- -p 3100 &
node tests/e2e.mjs http://localhost:3100 test-results   # 19 browser checks incl. mobile + dark mode (needs Playwright)
```

## Browser support notes

- **Listening audio** uses the Web Speech API (text-to-speech). Voices depend on the device: iOS and Android have good English voices, some Linux browsers have none. Without voices, a clearly labelled text mode is used and recorded as "text mode".
- **Speech-to-text** works in Chrome, Edge and Safari. Firefox records audio but you type the transcript yourself.
- Recordings are kept only while the page is open (privacy and storage); transcripts are saved.

## Remaining work, by priority

1. **Detailed lessons for weeks 5–36.** Weeks 1–4 are fully written and weeks 5–8 have an outline. The lesson format in `data/lessons.ts` is ready for more weeks.
2. **More practice sets** for Phase 3 (all four Listening parts, three-passage Academic Reading sets, more Task 1 and Task 2 prompts).
3. **Full-length timed mock mode** inside the app (60-minute Reading, 30-minute Listening, 60-minute Writing), with automatic logging to the mock-test table.
4. **Cloud sync** (sign-in plus a small database) if you want progress to follow you across devices automatically instead of export/import.
5. **Natural-voice listening audio**: pre-generated audio files for the scripts, or curated links to permitted external audio per lesson.
6. **Pronunciation feedback from audio**, only with a service that genuinely analyses speech. The app deliberately does not fake this.
7. **Installable PWA and offline mode**, plus daily study reminders.
8. **Adaptive difficulty**: automatically pick easier or harder exercises from recent accuracy. The current version recommends the next activity but does not change the difficulty of the content.
