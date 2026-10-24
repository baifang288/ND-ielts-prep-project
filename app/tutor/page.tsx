"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { askAI, useAiStatus } from "@/lib/ai-client";
import { progressSummary } from "@/lib/summary";
import { recommendNext } from "@/lib/stats";
import { lessonById } from "@/data/lessons";
import { OfficialNotice } from "@/components/Bits";

const QUICK: { label: string; text: string; needsInput?: string }[] = [
  { label: "อธิบายไวยากรณ์", text: "Please explain this grammar point in Thai with 4 simple examples and 3 practice questions (with answers at the end): ", needsInput: "เช่น present perfect vs past simple" },
  { label: "อธิบายคำศัพท์/collocation", text: "Please explain the meaning (in Thai), common collocations, word forms and 3 example sentences for: ", needsInput: "เช่น 'significant'" },
  { label: "สร้างแบบฝึกระดับของฉัน", text: "Create 6 original practice questions at my level for: ", needsInput: "เช่น True/False/Not Given เรื่องสิ่งแวดล้อม" },
  { label: "ควิซจากข้อผิดพลาดของฉัน", text: "Using my recent open mistakes in the progress summary, create a short quiz (6 questions) that targets the same problems. Put the answers and Thai explanations at the end." },
  { label: "แนะนำกิจกรรมถัดไป", text: "Based on my progress summary, what should I study next and why? Recommend one activity for today (60 minutes) focusing on my weakest skill. Mention the numbers you used." },
  { label: "ทบทวนความก้าวหน้ารายสัปดาห์", text: "Please review my progress this week from the summary: what went well, what to fix, and a concrete plan for next week. Be honest; do not estimate a band score from these short exercises." },
  { label: "ถามเรื่อง IELTS", text: "", needsInput: "พิมพ์คำถามเกี่ยวกับ IELTS ในช่องด้านล่าง" },
];

const GRAMMAR_LESSONS = ["d02", "d08", "d15", "d22"];

export default function TutorPage() {
  const { state, update } = useStore();
  const ai = useAiStatus();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const rec = recommendNext(state);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content) return;
    setError(null);
    const history = [...state.tutorChat, { role: "user" as const, content }];
    update((d) => { d.tutorChat = history.slice(-40); });
    setInput("");
    setPending(null);
    setLoading(true);
    const res = await askAI("tutor", { messages: history, context: progressSummary(state) }, state.settings.accessCode);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    update((d) => { d.tutorChat = [...history, { role: "assistant" as const, content: res.text }].slice(-40); });
  };

  const quick = (q: (typeof QUICK)[number]) => {
    if (q.needsInput) {
      setPending(q.text);
      setInput("");
    } else send(q.text);
  };

  const externalPrompt = `You are my IELTS Academic tutor. I am a Thai learner at CEFR B1, aiming for Overall 6.5 with no skill below 6.0. Explain in Thai with English examples. Never claim official scores; label any estimate as unofficial.

My progress summary from my study app:
${progressSummary(state)}

My question: ${input || "(write your question here)"}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(externalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div>
      <h1>ติวเตอร์ AI</h1>
      <OfficialNotice kind="ai" />
      <p className="small muted">ติวเตอร์จะไม่สร้างเฉลยหรือคะแนน IELTS &quot;ทางการ&quot; และไม่อ้างแหล่งที่มาที่ไม่มีจริง แบบฝึกที่สร้างเป็นต้นฉบับเพื่อฝึกเท่านั้น</p>

      <div className="card">
        <h2>แนะนำกิจกรรมถัดไป (ไม่ใช้ AI)</h2>
        <p style={{ marginBottom: 4 }}><b>{rec.th}</b></p>
        <p className="small muted">{rec.reasonTh}</p>
        <Link className="btn small" href={rec.href}>ไปเลย</Link>
      </div>

      {ai.configured ? (
        <div className="card">
          <div className="spread">
            <h2>คุยกับติวเตอร์</h2>
            {state.tutorChat.length > 0 && <button className="btn small ghost" onClick={() => update((d) => { d.tutorChat = []; })}>ล้างแชท</button>}
          </div>
          <div className="pill-list" style={{ marginBottom: 12 }}>
            {QUICK.map((q) => <button key={q.label} className="btn small" onClick={() => quick(q)} disabled={loading}>{q.label}</button>)}
          </div>
          <div className="chat" aria-live="polite">
            {state.tutorChat.length === 0 && <p className="muted small">เลือกปุ่มด้านบนหรือพิมพ์คำถาม ติวเตอร์จะเห็นสรุปความก้าวหน้าของคุณ (สถิติการเรียนเท่านั้น)</p>}
            {state.tutorChat.map((m, i) => <div key={i} className={`bubble ${m.role}${m.role === "user" ? " en" : ""}`}>{m.content}</div>)}
            {loading && <div className="bubble assistant muted">กำลังคิด…</div>}
          </div>
          {error && <div className="notice bad small" role="alert" style={{ marginTop: 8 }}>{error}</div>}
          {pending !== null && <p className="small" style={{ marginTop: 8 }}>เพิ่มรายละเอียดแล้วกดส่ง: <span className="muted">{QUICK.find((q) => q.text === pending)?.needsInput}</span></p>}
          <div className="row" style={{ marginTop: 8, flexWrap: "nowrap" }}>
            <label htmlFor="ask" className="sr-only">คำถาม</label>
            <textarea id="ask" value={input} onChange={(e) => setInput(e.target.value)} style={{ minHeight: 60 }} placeholder="พิมพ์คำถามเป็นภาษาไทยหรืออังกฤษ"
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send((pending ?? "") + input); }} />
            <button className="btn primary" disabled={loading || !input.trim()} onClick={() => send((pending ?? "") + input)}>ส่ง</button>
          </div>
          <p className="small muted">Ctrl/⌘ + Enter เพื่อส่ง</p>
        </div>
      ) : (
        <>
          <div className="notice info">
            <b>{ai.checked ? "ยังไม่ได้ตั้งค่า AI บนเซิร์ฟเวอร์" : "กำลังตรวจสถานะ AI…"}</b> — ระหว่างนี้ใช้เครื่องมือด้านล่างได้ทันที หรือคัดลอกคำสั่ง (มีสรุปความก้าวหน้าของคุณ) ไปถาม AI assistant ภายนอก
            {" "}<Link href="/settings#ai">วิธีตั้งค่า AI</Link>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <h3>ควิซจากข้อผิดพลาดของฉัน</h3>
              <p className="small">ฝึกแก้ข้อผิดพลาดจริงของคุณ ถูก 2 ครั้งติดกัน = แก้สำเร็จ</p>
              <Link className="btn small" href="/mistakes?practice=1">เริ่มควิซ</Link>
            </div>
            <div className="card">
              <h3>แบบฝึกที่เตรียมไว้</h3>
              <p className="small">Listening 6 ชุด · Reading 6 บท · Writing 11 โจทย์ · Speaking 6 หัวข้อ + 5 cue cards</p>
              <div className="row"><Link className="btn small" href="/listening">Listening</Link><Link className="btn small" href="/reading">Reading</Link></div>
            </div>
          </div>
          <div className="card">
            <h3>สรุปไวยากรณ์ (ภาษาไทย)</h3>
            {GRAMMAR_LESSONS.map((id) => {
              const l = lessonById(id)!;
              return (
                <details key={id} style={{ marginBottom: 6 }}>
                  <summary className="en">{l.title}</summary>
                  {l.explanationTh.map((p, i) => <p key={i} className="small">{p}</p>)}
                  <Link className="small" href={`/lesson/${id}`}>เปิดบทเรียนพร้อมแบบฝึก</Link>
                </details>
              );
            })}
          </div>
          <div className="card">
            <h3>ถาม AI assistant ภายนอก</h3>
            <label htmlFor="ext-q">คำถามของคุณ</label>
            <textarea id="ext-q" value={input} onChange={(e) => setInput(e.target.value)} style={{ minHeight: 70 }} />
            <details><summary className="small">ดูคำสั่งที่จะคัดลอก</summary><pre className="small en" style={{ whiteSpace: "pre-wrap" }}>{externalPrompt}</pre></details>
            <button className="btn" onClick={copy} style={{ marginTop: 8 }}>{copied ? "คัดลอกแล้ว ✓" : "คัดลอกคำสั่งพร้อมสรุปความก้าวหน้า"}</button>
          </div>
        </>
      )}
    </div>
  );
}
