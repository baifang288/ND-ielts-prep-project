"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { grade, type GradedQuestion } from "@/lib/actions";

export interface QuizProps {
  questions: Question[];
  groups?: { instructions: string; questions: Question[] }[];
  initialAnswers?: Record<string, string>;
  onAnswersChange?: (a: Record<string, string>) => void;
  /** Called once per submission with graded results. */
  onSubmit?: (graded: GradedQuestion[], answers: Record<string, string>) => void;
  submitLabel?: string;
  /** Extra UI rendered under each wrong answer after submission (e.g. error-reason picker). */
  renderAfterWrong?: (g: GradedQuestion) => React.ReactNode;
  disabled?: boolean;
  showEvidence?: boolean;
}

const RESULT_LABEL = { correct: "ถูกต้อง", spelling: "สะกดผิด (นับเป็นผิด)", wrong: "ไม่ถูกต้อง", blank: "ไม่ได้ตอบ" };

export default function Quiz({
  questions, groups, initialAnswers, onAnswersChange, onSubmit, submitLabel = "ตรวจคำตอบ", renderAfterWrong, disabled, showEvidence = true,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers ?? {});
  const [graded, setGraded] = useState<GradedQuestion[] | null>(null);

  const set = (id: string, v: string) => {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    onAnswersChange?.(next);
  };

  const submit = () => {
    const g = grade(questions, answers);
    setGraded(g);
    onSubmit?.(g, answers);
  };

  const retry = () => {
    setGraded(null);
    setAnswers({});
    onAnswersChange?.({});
  };

  const byId = new Map(graded?.map((g) => [g.q.id, g]));
  const unanswered = questions.filter((q) => !(answers[q.id] ?? "").trim()).length;
  const blocks = groups ?? [{ instructions: "", questions }];
  let n = 0;

  return (
    <div>
      {blocks.map((b, bi) => (
        <div key={bi} style={{ marginBottom: "0.5rem" }}>
          {b.instructions && <p className="en" style={{ fontStyle: "italic" }}>{b.instructions}</p>}
          {b.questions.map((q) => {
            n++;
            const g = byId.get(q.id);
            return (
              <div className="q" key={q.id}>
                <div className="q-prompt en">
                  {n}. {q.prompt}
                  {q.limit && <span className="badge" style={{ marginLeft: 6 }}>{q.limit}</span>}
                </div>
                {q.kind === "mcq" ? (
                  <div className="options" role="radiogroup" aria-label={`ข้อ ${n}`}>
                    {q.options!.map((o) => {
                      const chosen = answers[q.id] === o;
                      const cls = g ? (q.answer.includes(o) ? " correct" : chosen ? " wrong" : "") : "";
                      return (
                        <label key={o} className={`option en${cls}`}>
                          <input type="radio" name={`${q.id}-${bi}`} checked={chosen} disabled={!!g || disabled} onChange={() => set(q.id, o)} />
                          <span>{o}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="en"
                    aria-label={`คำตอบข้อ ${n}`}
                    value={answers[q.id] ?? ""}
                    disabled={!!g || disabled}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    onChange={(e) => set(q.id, e.target.value)}
                  />
                )}
                {g && (
                  <div className={`feedback ${g.result === "blank" ? "wrong" : g.result}`} role="status">
                    <strong>{RESULT_LABEL[g.result]}</strong>
                    {g.result !== "correct" && <> — คำตอบที่ถูก: <span className="en"><b>{q.answer[0]}</b></span></>}
                    <div>{q.explanationTh}</div>
                    {showEvidence && q.evidence && <div className="small en muted">Evidence: “{q.evidence}”</div>}
                    {g.result !== "correct" && renderAfterWrong?.(g)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {!graded ? (
        <div className="row" style={{ marginTop: "0.75rem" }}>
          <button className="btn primary" onClick={submit} disabled={disabled}>{submitLabel}</button>
          {unanswered > 0 && <span className="muted small">ยังไม่ได้ตอบ {unanswered} ข้อ (ส่งได้ ข้อว่างนับเป็นผิด)</span>}
        </div>
      ) : (
        <div className="spread" style={{ marginTop: "0.75rem" }}>
          <strong>
            ได้ {graded.filter((g) => g.result === "correct").length}/{graded.length} ข้อ (
            {Math.round((graded.filter((g) => g.result === "correct").length / graded.length) * 100)}%)
          </strong>
          <button className="btn" onClick={retry}>ทำใหม่อีกครั้ง</button>
        </div>
      )}
    </div>
  );
}
