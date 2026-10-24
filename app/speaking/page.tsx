"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore, uid } from "@/lib/store";
import { CUE_CARDS, PART1, SPEAKING_SELF_CHECK } from "@/data/speaking";
import Recorder, { type RecordingResult } from "@/components/Recorder";
import AiFeedback from "@/components/AiFeedback";
import { AiUnavailable } from "@/components/Bits";
import { askAI, useAiStatus } from "@/lib/ai-client";
import { setLastLocation } from "@/lib/actions";
import { countWords } from "@/lib/check";
import { formatThaiDate } from "@/lib/dates";

type Part = 1 | 2 | 3;

function externalPrompt(part: Part, question: string, transcript: string) {
  return `You are an IELTS Speaking tutor. I am a Thai learner at CEFR B1. Explain in Thai, keep corrections in English.
This is a TRANSCRIPT only, so please do not judge my pronunciation or real fluency.
For my answer: 1) strongest aspects, 2) the most important errors (quote → correction → Thai explanation), 3) more natural alternative expressions, 4) one follow-up question so I can try again. Do not give a band score.

IELTS Speaking Part ${part}
Question: ${question}
My transcript:
"""
${transcript || "(paste your transcript here)"}
"""`;
}

function SpeakingInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, update } = useStore();
  const ai = useAiStatus();
  const part = (Number(params.get("part")) || 1) as Part;
  const topicId = params.get("topic") ?? PART1[0].id;
  const cardId = params.get("card") ?? CUE_CARDS[0].id;
  const topic = PART1.find((t) => t.id === topicId) ?? PART1[0];
  const card = CUE_CARDS.find((c) => c.id === cardId) ?? CUE_CARDS[0];
  const questions = part === 1 ? topic.questions : part === 3 ? card.part3 : [card.title];
  const [qi, setQi] = useState(0);
  const question = questions[Math.min(qi, questions.length - 1)];

  const [prepLeft, setPrepLeft] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [transcript, setTranscript] = useState("");
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = (q: Record<string, string>) => {
    const sp = new URLSearchParams({ part: String(part), topic: topicId, card: cardId, ...q });
    router.replace(`/speaking?${sp.toString()}`);
  };

  const reset = () => { setResult(null); setTranscript(""); setCheck({}); setSessionId(null); setError(null); setPrepLeft(null); setNotes(""); };

  useEffect(() => { setQi(0); reset(); }, [part, topicId, cardId]);
  useEffect(() => {
    update((d) => setLastLocation(d, `/speaking?part=${part}&topic=${topicId}&card=${cardId}`, `Speaking Part ${part}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, topicId, cardId]);

  useEffect(() => {
    if (prepLeft === null || prepLeft <= 0) return;
    const t = setTimeout(() => setPrepLeft(prepLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [prepLeft]);

  const attemptNo = state.speaking.filter((s) => s.question === question).length + 1;
  const session = state.speaking.find((s) => s.id === sessionId);

  const save = () => {
    const id = uid("s");
    update((d) => {
      d.speaking.unshift({
        id, date: new Date().toISOString(), part, question, transcript,
        transcriptSource: result?.transcriptSource === "speech-recognition" && transcript === result.transcript ? "speech-recognition" : "typed",
        durationSec: result?.durationSec ?? 0, selfCheck: check, attemptNo, feedbackKind: "self-check",
      });
    });
    setSessionId(id);
  };

  const requestAI = async () => {
    if (!sessionId) save();
    setLoading(true);
    setError(null);
    const res = await askAI("speaking-feedback", { part, question, transcript, durationSec: result?.durationSec ?? 0, source: result?.transcriptSource }, state.settings.accessCode);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    update((d) => {
      const s = d.speaking.find((x) => x.question === question && x.transcript === transcript) ?? d.speaking[0];
      if (s) { s.feedback = res.text; s.feedbackKind = "ai"; }
    });
  };

  const history = state.speaking.filter((s) => s.part === part).slice(0, 10);

  return (
    <div className="skill-speaking">
      <h1 className="skill-head">Speaking</h1>
      <p className="small muted">ฝึกพูดโดยไม่ใช้สคริปต์ บันทึกเสียงและฟังตัวเอง ถ้าเบราว์เซอร์รองรับจะถอดเสียงเป็นข้อความให้ คำถามเป็นต้นฉบับของแอปในรูปแบบ IELTS</p>

      <div className="tabs" role="tablist">
        {([1, 2, 3] as Part[]).map((p) => (
          <button key={p} role="tab" aria-selected={part === p} onClick={() => go({ part: String(p) })}>Part {p}</button>
        ))}
      </div>

      <div className="card skill-card">
        {part === 1 ? (
          <div className="field">
            <label htmlFor="topic">หัวข้อ Part 1 (เรื่องใกล้ตัว)</label>
            <select id="topic" value={topic.id} onChange={(e) => go({ topic: e.target.value })}>
              {PART1.map((t) => <option key={t.id} value={t.id}>{t.topic}</option>)}
            </select>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="card">Cue card {part === 3 ? "(Part 3 คำถามต่อเนื่องจากหัวข้อนี้)" : ""}</label>
            <select id="card" value={card.id} onChange={(e) => go({ card: e.target.value })}>
              {CUE_CARDS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        )}

        {part === 2 ? (
          <div className="card en" style={{ background: "var(--speaking-soft)" }}>
            <b>{card.title}</b>
            <p style={{ margin: "4px 0" }}>You should say:</p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>{card.points.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ) : (
          <div>
            <p className="small muted">คำถามที่ {Math.min(qi, questions.length - 1) + 1}/{questions.length}</p>
            <p className="en" style={{ fontSize: "1.2rem", fontWeight: 600 }}>{question}</p>
            <div className="row">
              <button className="btn small" disabled={qi === 0} onClick={() => { setQi(qi - 1); reset(); }}>← คำถามก่อน</button>
              <button className="btn small" disabled={qi >= questions.length - 1} onClick={() => { setQi(qi + 1); reset(); }}>คำถามถัดไป →</button>
            </div>
          </div>
        )}
        <p className="small muted" style={{ marginTop: 8 }}>
          {part === 1 && "ตอบ 2–4 ประโยค: Answer → Reason → Example"}
          {part === 2 && "เตรียม 1 นาที (จดคำสำคัญ) แล้วพูดได้ไม่เกิน 2 นาที"}
          {part === 3 && "ให้ความเห็น + เหตุผล + ตัวอย่างระดับสังคม ประมาณ 30–60 วินาที"}
          {attemptNo > 1 && ` · ครั้งที่ ${attemptNo} สำหรับคำถามนี้`}
        </p>
      </div>

      {part === 2 && !result && (
        <div className="card">
          {prepLeft === null ? (
            <button className="btn" onClick={() => setPrepLeft(60)}>เริ่มเวลาเตรียม 1 นาที</button>
          ) : (
            <p role="timer"><b>{prepLeft > 0 ? `เวลาเตรียม: ${prepLeft} วินาที` : "หมดเวลาเตรียม — เริ่มพูดได้เลย"}</b></p>
          )}
          <label htmlFor="notes" style={{ marginTop: 8 }}>โน้ตคำสำคัญ (ไม่ใช่ประโยคเต็ม)</label>
          <textarea id="notes" className="en" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 80 }} />
        </div>
      )}

      {!result ? (
        <div className="card">
          <Recorder maxSec={part === 2 ? 120 : 90} onFinish={(r) => { setResult(r); setTranscript(r.transcript); }} />
        </div>
      ) : (
        <div className="card">
          <h3>คำตอบของฉัน ({result.durationSec} วินาที)</h3>
          {result.audioUrl ? (
            <audio controls src={result.audioUrl} style={{ width: "100%" }} />
          ) : (
            <p className="small muted">ไม่มีไฟล์เสียง (เบราว์เซอร์ไม่รองรับหรือไม่อนุญาตไมโครโฟน)</p>
          )}
          <p className="small muted">ไฟล์เสียงอยู่เฉพาะในหน้านี้ ไม่ถูกเก็บถาวร — ฟังซ้ำก่อนออกจากหน้า</p>
          <label htmlFor="tr">Transcript {result.transcriptSource === "speech-recognition" ? "(ถอดเสียงอัตโนมัติ — อาจผิดบ้าง แก้ไขได้)" : "(พิมพ์สิ่งที่คุณพูด)"}</label>
          <textarea id="tr" className="en" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          <p className="small muted">{countWords(transcript)} คำ</p>

          <h3>ตรวจตัวเอง</h3>
          {SPEAKING_SELF_CHECK.map((c) => (
            <label key={c.id} className="checkline">
              <input type="checkbox" checked={!!check[c.id]} onChange={(e) => setCheck({ ...check, [c.id]: e.target.checked })} />
              <span><span className="en">{c.label}</span><br /><span className="small muted">{c.hintTh}</span></span>
            </label>
          ))}

          <div className="row" style={{ marginTop: 8 }}>
            {!sessionId && <button className="btn" onClick={save}>บันทึกการฝึก</button>}
            {ai.configured && (
              <button className="btn primary" onClick={requestAI} disabled={loading || countWords(transcript) < 8}>
                {loading ? "กำลังวิเคราะห์…" : "ขอ feedback จาก AI (จาก transcript)"}
              </button>
            )}
            <button className="btn" onClick={() => { if (!sessionId) save(); reset(); }}>ลองพูดอีกครั้ง</button>
          </div>
          {sessionId && <p className="small" role="status">บันทึกการฝึกแล้ว</p>}
          {ai.configured && countWords(transcript) < 8 && <p className="small muted">ต้องมี transcript อย่างน้อย 8 คำจึงขอ feedback ได้</p>}
          {error && <div className="notice bad small" role="alert">{error}</div>}
          <p className="small muted">
            AI ได้รับเฉพาะข้อความ จึง<b>ไม่ประเมินการออกเสียงหรือความคล่องจริง</b> — ฟังเสียงตัวเองเพื่อตรวจสองเรื่องนี้ หรือให้ครู/เพื่อนฟัง
          </p>
        </div>
      )}

      {result && !ai.configured && <AiUnavailable status={ai} prompt={externalPrompt(part, question, transcript)} />}

      {session?.feedback && (
        <div className="card">
          <h3>Feedback</h3>
          <AiFeedback text={session.feedback} skill="speaking" source={`speaking:${part}`} />
        </div>
      )}

      {result && !session?.feedback && (
        <div className="card">
          <h3>คำถามต่อเนื่อง (ลองตอบอีกครั้ง)</h3>
          <p className="en">
            {part === 1 ? "Can you give me a specific example of that?" : part === 2 ? card.part3[0] : "Why do you think some people disagree with that view?"}
          </p>
        </div>
      )}

      <div className="card">
        <h3>ประวัติการฝึก Part {part}</h3>
        {history.length ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {history.map((h) => (
              <li key={h.id} style={{ borderBottom: "1px solid var(--border)", padding: "6px 0" }}>
                <div className="small"><b className="en">{h.question}</b> · {formatThaiDate(h.date.slice(0, 10), false)} · {h.durationSec}s · ครั้งที่ {h.attemptNo} {h.feedbackKind === "ai" && <span className="badge info">AI feedback</span>}</div>
                {h.transcript && <details><summary className="small">transcript</summary><p className="en small">{h.transcript}</p>{h.feedback && <div className="ai-output small">{h.feedback}</div>}</details>}
              </li>
            ))}
          </ul>
        ) : <p className="small muted">ยังไม่มีการฝึก Part {part}</p>}
      </div>
    </div>
  );
}

export default function SpeakingPage() {
  return (
    <Suspense fallback={<p className="muted">กำลังโหลด…</p>}>
      <SpeakingInner />
    </Suspense>
  );
}
