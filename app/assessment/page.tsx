"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  ASSESSMENT_GRAMMAR, ASSESSMENT_LISTENING, ASSESSMENT_READING, ASSESSMENT_SPEAKING_QUESTIONS, ASSESSMENT_VOCAB, ASSESSMENT_WRITING_PROMPT,
} from "@/data/assessment";
import Quiz from "@/components/Quiz";
import TTSPlayer from "@/components/TTSPlayer";
import Recorder from "@/components/Recorder";
import { mistakesFromGraded, recordAttempt, type GradedQuestion } from "@/lib/actions";
import { countWords } from "@/lib/check";
import { formatThaiDate, today } from "@/lib/dates";
import type { Area, Skill } from "@/lib/types";

const STEPS = ["Grammar & Vocabulary", "Reading", "Listening", "Writing", "Speaking", "ประเมินตนเอง"];
const SKILL_TH: Record<Skill, string> = { listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking" };

export default function AssessmentPage() {
  const { state, update } = useStore();
  const [step, setStep] = useState(state.assessment ? -1 : 0);
  const [sections, setSections] = useState<Record<string, { correct: number; total: number }>>({});
  const [writing, setWriting] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [audio, setAudio] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<Skill, number>>({ listening: 3, reading: 3, writing: 3, speaking: 3 });
  const [rate, setRate] = useState(state.settings.ttsRate);
  const [textMode, setTextMode] = useState(false);

  const record = (key: string, area: Area, title: string) => (g: GradedQuestion[]) => {
    setSections((s) => ({ ...s, [key]: { correct: g.filter((x) => x.result === "correct").length, total: g.length } }));
    update((d) => {
      recordAttempt(d, g, { source: "assessment", refId: `assessment-${key}`, title: `Initial assessment: ${title}`, skill: area });
      mistakesFromGraded(d, g, area, `assessment:${key}`);
    });
  };

  const finish = () => {
    update((d) => {
      d.assessment = { completedAt: new Date().toISOString(), sections, writingSample: writing, speakingTranscript: speaking, selfRatings: ratings };
      if (!d.lessons.d01) d.lessons.d01 = { status: "completed", at: new Date().toISOString() };
    });
    setStep(-1);
  };

  if (step === -1 && state.assessment) {
    const a = state.assessment;
    const rows = Object.entries(a.sections).map(([k, v]) => ({ k, pct: Math.round((v.correct / v.total) * 100), ...v }));
    const weakest = [...rows].sort((x, y) => x.pct - y.pct)[0];
    return (
      <div>
        <h1>ผลแบบประเมินเริ่มต้น</h1>
        <p className="muted small">ทำเมื่อ {formatThaiDate(a.completedAt.slice(0, 10))} · ผลนี้เป็นความแม่นยำของแบบฝึกสั้น ๆ <b>ไม่ใช่ band score IELTS</b></p>
        <div className="card">
          <table>
            <thead><tr><th>ส่วน</th><th>ผล</th></tr></thead>
            <tbody>
              {rows.map((r) => <tr key={r.k}><td>{r.k}</td><td><b>{r.correct}/{r.total}</b> ({r.pct}%)</td></tr>)}
              <tr><td>Writing sample</td><td>{countWords(a.writingSample)} คำ (เก็บไว้เปรียบเทียบ)</td></tr>
              <tr><td>Speaking transcript</td><td>{a.speakingTranscript ? `${countWords(a.speakingTranscript)} คำ` : "ไม่มี"}</td></tr>
            </tbody>
          </table>
          {weakest && <p style={{ marginTop: 8 }}>จุดที่ควรเน้นก่อน: <b>{weakest.k}</b> ({weakest.pct}%)</p>}
        </div>
        <div className="card">
          <h3>ความมั่นใจของตัวเอง (1–5)</h3>
          <p className="small">{(Object.keys(a.selfRatings) as Skill[]).map((k) => `${SKILL_TH[k]} ${a.selfRatings[k]}`).join(" · ")}</p>
          <h3>งานเขียนวันแรก</h3>
          <p className="en small" style={{ whiteSpace: "pre-wrap" }}>{a.writingSample || "—"}</p>
          {a.speakingTranscript && <><h3>คำพูดวันแรก (transcript)</h3><p className="en small" style={{ whiteSpace: "pre-wrap" }}>{a.speakingTranscript}</p></>}
        </div>
        <div className="row">
          <Link className="btn primary" href="/">กลับแดชบอร์ด</Link>
          <button className="btn" onClick={() => { setSections({}); setStep(0); }}>ทำแบบประเมินอีกครั้ง (เช่น หลังจบเดือนที่ 2)</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>แบบประเมินเริ่มต้น</h1>
      <p className="small muted">
        ใช้เวลาประมาณ 60 นาที ทำตามความสามารถจริง ไม่ใช้ตัวช่วยแปล ผลใช้ปรับแผนการเรียน และ<b>ไม่แปลงเป็น band score</b> เพราะแบบประเมินสั้น ๆ ไม่สามารถทำนายคะแนนสอบจริงได้
      </p>
      <ol className="row small" style={{ listStyle: "none", padding: 0 }} aria-label="ขั้นตอน">
        {STEPS.map((s, i) => <li key={s} className={`badge ${i === step ? "info" : i < step ? "ok" : ""}`}>{i + 1}. {s}</li>)}
      </ol>

      {step === 0 && (
        <div className="card">
          <h2>Grammar (10) & Vocabulary (5)</h2>
          <Quiz questions={[...ASSESSMENT_GRAMMAR, ...ASSESSMENT_VOCAB]} showEvidence={false} onSubmit={record("Grammar & Vocabulary", "grammar", "grammar & vocabulary")} />
        </div>
      )}
      {step === 1 && (
        <div className="card skill-reading">
          <h2 className="skill-head">Reading: {ASSESSMENT_READING.title}</h2>
          <p className="en">{ASSESSMENT_READING.text}</p>
          <Quiz questions={ASSESSMENT_READING.questions} onSubmit={record("Reading", "reading", "reading")} />
        </div>
      )}
      {step === 2 && (
        <div className="card skill-listening">
          <h2 className="skill-head">Listening</h2>
          <p className="small">ฟังได้สูงสุด 2 ครั้ง แล้วตอบคำถาม</p>
          {!textMode && <TTSPlayer script={ASSESSMENT_LISTENING.script} rate={rate} onRateChange={setRate} maxPlays={2} onUnsupported={() => setTextMode(true)} />}
          {textMode && (
            <details className="notice">
              <summary>โหมดข้อความ (เบราว์เซอร์ไม่มีเสียงสังเคราะห์) — เปิดอ่านสคริปต์</summary>
              {ASSESSMENT_LISTENING.script.map((l, i) => <p key={i} className="en small"><b>{l.speaker}:</b> {l.text}</p>)}
            </details>
          )}
          <Quiz questions={ASSESSMENT_LISTENING.questions} onSubmit={record(textMode ? "Listening (text mode)" : "Listening", "listening", textMode ? "listening (text mode)" : "listening")} />
        </div>
      )}
      {step === 3 && (
        <div className="card skill-writing">
          <h2 className="skill-head">Writing</h2>
          <p className="en">{ASSESSMENT_WRITING_PROMPT}</p>
          <textarea className="editor en" value={writing} onChange={(e) => setWriting(e.target.value)} aria-label="งานเขียน" />
          <p className="small muted">{countWords(writing)} คำ</p>
        </div>
      )}
      {step === 4 && (
        <div className="card skill-speaking">
          <h2 className="skill-head">Speaking</h2>
          <p>ตอบ 3 คำถามต่อเนื่องในการบันทึกครั้งเดียว (ประมาณ 1–2 นาที):</p>
          <ol className="en">{ASSESSMENT_SPEAKING_QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
          <Recorder maxSec={180} onFinish={(r) => { setAudio(r.audioUrl); if (r.transcript) setSpeaking(r.transcript); }} />
          {audio && <audio controls src={audio} style={{ width: "100%", marginTop: 8 }} />}
          <label htmlFor="sp-t" style={{ marginTop: 8 }}>Transcript (แก้ไขหรือพิมพ์เองได้)</label>
          <textarea id="sp-t" className="en" value={speaking} onChange={(e) => setSpeaking(e.target.value)} />
          <p className="small muted">ไฟล์เสียงไม่ถูกเก็บถาวร (ความเป็นส่วนตัวและพื้นที่) — เก็บเฉพาะ transcript</p>
        </div>
      )}
      {step === 5 && (
        <div className="card">
          <h2>ประเมินความมั่นใจของตัวเอง</h2>
          <p className="small muted">1 = ไม่มั่นใจเลย, 5 = มั่นใจมาก</p>
          {(Object.keys(ratings) as Skill[]).map((k) => (
            <div className="field" key={k}>
              <label htmlFor={`r-${k}`}>{SKILL_TH[k]}: {ratings[k]}</label>
              <input id={`r-${k}`} type="range" min={1} max={5} value={ratings[k]} onChange={(e) => setRatings({ ...ratings, [k]: Number(e.target.value) })} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      )}

      <div className="spread">
        <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← ก่อนหน้า</button>
        {step < STEPS.length - 1 ? (
          <button className="btn primary" onClick={() => setStep(step + 1)}>ถัดไป →</button>
        ) : (
          <button className="btn primary" onClick={finish} disabled={Object.keys(sections).length < 3}>บันทึกผลแบบประเมิน</button>
        )}
      </div>
      {step === STEPS.length - 1 && Object.keys(sections).length < 3 && (
        <p className="small muted" style={{ textAlign: "right" }}>ต้องกดตรวจคำตอบใน Grammar, Reading และ Listening ก่อนบันทึก</p>
      )}
      <p className="small muted">วันนี้: {formatThaiDate(today())}</p>
    </div>
  );
}
