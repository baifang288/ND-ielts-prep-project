"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { LISTENING, LISTENING_ERROR_REASONS } from "@/data/listening";
import TTSPlayer, { speak } from "@/components/TTSPlayer";
import Quiz from "@/components/Quiz";
import { Empty, OfficialNotice, VocabList } from "@/components/Bits";
import { mistakesFromGraded, recordAttempt, setLastLocation, type GradedQuestion } from "@/lib/actions";
import type { MistakeCategory } from "@/lib/types";

export default function ListeningExercisePage() {
  const { id } = useParams<{ id: string }>();
  const ex = LISTENING.find((x) => x.id === id);
  const { state, update } = useStore();
  const [examMode, setExamMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [line, setLine] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ex) update((d) => setLastLocation(d, `/listening/${ex.id}`, `Listening ${ex.id}: ${ex.title}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onUnsupported = useCallback(() => setTextMode(true), []);

  if (!ex) return <Empty action={<Link className="btn" href="/listening">กลับ</Link>}>ไม่พบแบบฝึกนี้</Empty>;

  const source = `listening:${ex.id}`;
  const pastAttempts = state.attempts.filter((a) => a.refId === ex.id);

  const setReason = (g: GradedQuestion, value: string) => {
    setReasons((r) => ({ ...r, [g.q.id]: value }));
    update((d) => {
      const m = d.mistakes.find((x) => x.source === source && x.practice === g.q.prompt);
      if (m) m.category = value as MistakeCategory;
    });
  };

  return (
    <div className="skill-listening">
      <p className="small"><Link href="/listening">← Listening</Link></p>
      <div className="spread">
        <h1 className="en">{ex.id}. {ex.title}</h1>
        <span className="badge skill-chip">{ex.level}</span>
      </div>
      <p>{ex.focusTh}</p>
      <OfficialNotice kind="original" />

      {!submitted && !textMode && (
        <label className="checkline">
          <input type="checkbox" checked={examMode} onChange={(e) => { setExamMode(e.target.checked); setRunKey((k) => k + 1); }} />
          <span>โหมดสอบจริง: ฟังได้ครั้งเดียว (ปกติฟังได้ 2 ครั้งก่อนส่งคำตอบ)</span>
        </label>
      )}

      {!textMode && (
        <TTSPlayer
          key={`${runKey}-${submitted}`}
          script={ex.script}
          rate={state.settings.ttsRate}
          onRateChange={(r) => update((d) => { d.settings.ttsRate = r; })}
          maxPlays={submitted ? null : examMode ? 1 : 2}
          onLineChange={setLine}
          onUnsupported={onUnsupported}
        />
      )}

      {textMode && !submitted && (
        <div className="card">
          <p className="badge warn">โหมดข้อความ (ไม่มีเสียง)</p>
          <p className="small muted">เบราว์เซอร์นี้ไม่มีเสียงสังเคราะห์ จึงฝึกด้วยการอ่านสคริปต์แทน ผลจะถูกบันทึกแยกเป็น &quot;text mode&quot; เพราะไม่ใช่การฟังจริง</p>
          {ex.script.map((l, i) => <p key={i} className="script-line en"><b>{l.speaker}:</b> {l.text}</p>)}
        </div>
      )}

      <div className="card">
        <h2>คำถาม</h2>
        <p className="en" style={{ fontStyle: "italic" }}>{ex.instructions}</p>
        <Quiz
          questions={ex.questions}
          onSubmit={(g) => {
            setSubmitted(true);
            update((d) => {
              recordAttempt(d, g, { source: "listening", refId: ex.id, title: `${ex.id} ${ex.title}${textMode ? " (text mode)" : ""}`, skill: "listening", timed: examMode });
              mistakesFromGraded(d, g, "listening", source, (x) =>
                x.result === "spelling" ? "spelling" : /^\d/.test(x.q.answer[0]) ? "listening-numbers" : "listening-missed-keyword",
              );
            });
          }}
          renderAfterWrong={(g) => (
            <div style={{ marginTop: 6 }}>
              <label className="small" htmlFor={`why-${g.q.id}`}>ทำไมถึงผิด? (ช่วยวิเคราะห์จุดอ่อน)</label>
              <select id={`why-${g.q.id}`} value={reasons[g.q.id] ?? ""} onChange={(e) => setReason(g, e.target.value)}>
                <option value="">— เลือกเหตุผล —</option>
                {LISTENING_ERROR_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          )}
        />
      </div>

      {submitted ? (
        <div className="card">
          <h2>สคริปต์ (Transcript)</h2>
          <p className="small muted">กด ▶ เพื่อฟังทีละประโยค ฟังประโยคที่ตอบผิดซ้ำ 3 ครั้ง</p>
          {ex.script.map((l, i) => (
            <div key={i} className={`script-line en row${line === i ? " active" : ""}`} style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
              <button className="btn small ghost" aria-label={`ฟังประโยคที่ ${i + 1}`} onClick={() => speak(l.text, state.settings.ttsRate)}>▶</button>
              <span><b>{l.speaker}:</b> {l.text}</span>
            </div>
          ))}
        </div>
      ) : (
        !textMode && <p className="small muted">สคริปต์จะเปิดให้ดูหลังส่งคำตอบครั้งแรก</p>
      )}

      <div className="card"><VocabList items={ex.vocab} source={source} /></div>
      {pastAttempts.length > 0 && (
        <p className="small muted">เคยทำแล้ว {pastAttempts.length} ครั้ง · ล่าสุด {pastAttempts[pastAttempts.length - 1].correct}/{pastAttempts[pastAttempts.length - 1].total}</p>
      )}
    </div>
  );
}
