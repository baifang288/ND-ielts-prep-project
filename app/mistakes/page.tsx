"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addMistake, recordAttempt } from "@/lib/actions";
import { checkAnswer } from "@/lib/check";
import { formatThaiDate, today } from "@/lib/dates";
import { AREA_LABEL, openMistakeCategories } from "@/lib/stats";
import { MISTAKE_CATEGORIES, MISTAKE_LABEL } from "@/lib/labels";
import { Empty } from "@/components/Bits";
import type { Area, MistakeCategory, MistakeItem, QType } from "@/lib/types";

/** A mistake counts as fixed after two correct attempts in a row. */
function isFixed(m: MistakeItem) {
  const a = m.attempts;
  return a.length >= 2 && a[a.length - 1].ok && a[a.length - 2].ok;
}

function Practice({ onExit }: { onExit: () => void }) {
  const { state, update } = useStore();
  // Oldest open mistakes first, max 10 per session.
  const ids = useMemo(() => state.mistakes.filter((m) => !m.resolved).slice(-10).reverse().map((m) => m.id), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const m = state.mistakes.find((x) => x.id === ids[i]);

  if (!ids.length) return <Empty action={<button className="btn" onClick={onExit}>กลับ</button>}>ไม่มีข้อผิดพลาดที่ต้องฝึก 🎉</Empty>;
  if (!m) {
    return (
      <Empty action={<button className="btn primary" onClick={onExit}>กลับไปสมุดข้อผิดพลาด</button>}>
        จบรอบนี้แล้ว: ถูก {score.c}/{score.t} ข้อ
      </Empty>
    );
  }

  const check = () => {
    const ok = checkAnswer(answer, [m.corrected]) === "correct";
    setResult(ok);
    setScore((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    update((d) => {
      const x = d.mistakes.find((y) => y.id === m.id)!;
      x.attempts.push({ date: today(), ok });
      if (isFixed(x)) x.resolved = true;
      const qtype: QType = m.skill === "reading" ? "detail" : m.skill === "listening" ? "detail" : "grammar";
      recordAttempt(d, [{ q: { id: m.id, kind: "text", qtype, prompt: m.practice ?? m.original, answer: [m.corrected], explanationTh: m.explanationTh }, given: answer, result: ok ? "correct" : "wrong" }], {
        source: "mistake-quiz", refId: m.id, title: "Mistake review", skill: m.skill as Area,
      });
    });
  };
  const next = () => { setI(i + 1); setAnswer(""); setResult(null); };
  const isSentence = !m.options && (m.practice ?? "").startsWith("Correct this sentence");

  return (
    <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
      <p className="small muted">ข้อที่ {i + 1}/{ids.length} · {MISTAKE_LABEL[m.category] ?? m.category} · {AREA_LABEL[m.skill as Area] ?? m.skill}</p>
      {isSentence ? (
        <>
          <p>แก้ประโยคนี้ให้ถูกต้อง:</p>
          <p className="en" style={{ fontSize: "1.1rem" }}>❌ {m.original}</p>
        </>
      ) : (
        <>
          <p>ลองตอบคำถามนี้อีกครั้ง:</p>
          <p className="en" style={{ whiteSpace: "pre-wrap", fontWeight: 600 }}>{m.practice ?? m.original}</p>
        </>
      )}
      {m.options ? (
        <div className="options">
          {m.options.map((o) => (
            <label key={o} className={`option en${result !== null ? (o === m.corrected ? " correct" : answer === o ? " wrong" : "") : ""}`}>
              <input type="radio" name="opt" checked={answer === o} disabled={result !== null} onChange={() => setAnswer(o)} /> {o}
            </label>
          ))}
        </div>
      ) : (
        <input type="text" className="en" value={answer} disabled={result !== null} onChange={(e) => setAnswer(e.target.value)} aria-label="คำตอบ" onKeyDown={(e) => e.key === "Enter" && answer.trim() && result === null && check()} />
      )}
      {result === null ? (
        <button className="btn primary" style={{ marginTop: 8 }} onClick={check} disabled={!answer.trim()}>ตรวจ</button>
      ) : (
        <div className={`feedback ${result ? "correct" : "wrong"}`}>
          <b>{result ? "ถูกต้อง" : "ยังไม่ถูก"}</b> — <span className="en">✅ {m.corrected}</span>
          {m.explanationTh && <div style={{ whiteSpace: "pre-wrap" }}>{m.explanationTh}</div>}
          <button className="btn small" style={{ marginTop: 8 }} onClick={next}>ข้อถัดไป →</button>
        </div>
      )}
    </div>
  );
}

function MistakesInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, update } = useStore();
  const [cat, setCat] = useState("");
  const [show, setShow] = useState<"open" | "resolved" | "all">("open");
  const [form, setForm] = useState({ original: "", corrected: "", explanationTh: "", category: "verb-tense" as MistakeCategory, skill: "writing" as Area, practice: "" });

  if (params.get("practice") === "1") {
    return (
      <div>
        <h1>ฝึกจากข้อผิดพลาดของฉัน</h1>
        <p className="small muted">ถูก 2 ครั้งติดกัน = แก้ไขสำเร็จ (ย้ายไปหมวด &quot;แก้แล้ว&quot;)</p>
        <Practice onExit={() => router.push("/mistakes")} />
      </div>
    );
  }

  const cats = openMistakeCategories(state);
  const list = state.mistakes.filter((m) => (show === "all" || (show === "open" ? !m.resolved : m.resolved)) && (!cat || m.category === cat));
  const open = state.mistakes.filter((m) => !m.resolved).length;

  return (
    <div>
      <div className="spread">
        <h1>สมุดข้อผิดพลาด</h1>
        <button className="btn primary" disabled={!open} onClick={() => router.push("/mistakes?practice=1")}>ฝึกจากข้อผิดพลาด ({open})</button>
      </div>
      <p className="small muted">คำตอบที่ผิดในบทเรียนและแบบฝึกถูกเพิ่มที่นี่อัตโนมัติ และนำกลับมาเป็นแบบฝึกทบทวน คุณบันทึกข้อผิดพลาดจาก Writing/Speaking หรือจากครูได้เองด้วย</p>

      {cats.length > 0 && (
        <div className="card">
          <h3>หมวดที่ผิดบ่อย (ยังไม่แก้)</h3>
          <div className="pill-list">
            {cats.map((c) => (
              <button key={c.category} className={`btn small${cat === c.category ? " primary" : ""}`} onClick={() => setCat(cat === c.category ? "" : c.category)}>
                {MISTAKE_LABEL[c.category] ?? c.category} · {c.count}
              </button>
            ))}
          </div>
        </div>
      )}

      <details className="card">
        <summary>+ บันทึกข้อผิดพลาดเอง</summary>
        <div className="grid grid-2" style={{ marginTop: 8 }}>
          <div className="field"><label htmlFor="f-o">ประโยค/คำตอบเดิม *</label><input id="f-o" type="text" className="en" value={form.original} onChange={(e) => setForm({ ...form, original: e.target.value })} /></div>
          <div className="field"><label htmlFor="f-c">ฉบับที่ถูกต้อง *</label><input id="f-c" type="text" className="en" value={form.corrected} onChange={(e) => setForm({ ...form, corrected: e.target.value })} /></div>
          <div className="field"><label htmlFor="f-e">คำอธิบาย (ภาษาไทย)</label><input id="f-e" type="text" value={form.explanationTh} onChange={(e) => setForm({ ...form, explanationTh: e.target.value })} /></div>
          <div className="field"><label htmlFor="f-p">คำถามฝึกที่คล้ายกัน (ไม่บังคับ)</label><input id="f-p" type="text" className="en" value={form.practice} onChange={(e) => setForm({ ...form, practice: e.target.value })} placeholder="เว้นว่าง = ให้แก้ประโยคเดิม" /></div>
          <div className="field">
            <label htmlFor="f-cat">หมวด</label>
            <select id="f-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MistakeCategory })}>
              {MISTAKE_CATEGORIES.map((c) => <option key={c} value={c}>{MISTAKE_LABEL[c]}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-s">ทักษะ</label>
            <select id="f-s" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value as Area })}>
              {(["writing", "speaking", "reading", "listening", "grammar", "vocab"] as Area[]).map((a) => <option key={a} value={a}>{AREA_LABEL[a]}</option>)}
            </select>
          </div>
        </div>
        <button
          className="btn primary"
          disabled={!form.original.trim() || !form.corrected.trim()}
          onClick={() => {
            update((d) => { addMistake(d, { ...form, source: "manual", practice: form.practice.trim() || `Correct this sentence: ${form.original}` }); });
            setForm({ ...form, original: "", corrected: "", explanationTh: "", practice: "" });
          }}
        >
          บันทึก
        </button>
      </details>

      <div className="tabs" role="tablist">
        {(["open", "resolved", "all"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={show === k} onClick={() => setShow(k)}>
            {k === "open" ? "ยังไม่แก้" : k === "resolved" ? "แก้แล้ว" : "ทั้งหมด"}
          </button>
        ))}
      </div>

      {!list.length ? (
        <Empty>{state.mistakes.length ? "ไม่มีรายการในมุมมองนี้" : "ยังไม่มีข้อผิดพลาดที่บันทึกไว้ — เริ่มทำบทเรียนหรือแบบฝึก แล้วข้อที่ผิดจะมาอยู่ที่นี่"}</Empty>
      ) : (
        list.map((m) => (
          <div className="card" key={m.id}>
            <div className="spread small">
              <span><span className="badge">{MISTAKE_LABEL[m.category] ?? m.category}</span> <span className="muted">{AREA_LABEL[m.skill as Area] ?? m.skill} · {formatThaiDate(m.date, false)}</span></span>
              <span className={`badge ${m.resolved ? "ok" : "warn"}`}>{m.resolved ? "แก้สำเร็จ" : `ฝึกแล้ว ${m.attempts.length} ครั้ง`}</span>
            </div>
            <p className="en" style={{ whiteSpace: "pre-wrap", margin: "6px 0 2px" }}>❌ {m.original}</p>
            <p className="en" style={{ margin: "0 0 4px" }}>✅ {m.corrected}</p>
            {m.explanationTh && <p className="small" style={{ whiteSpace: "pre-wrap" }}>{m.explanationTh}</p>}
            <div className="row">
              <select
                aria-label="เปลี่ยนหมวด"
                value={m.category}
                onChange={(e) => update((d) => { d.mistakes.find((x) => x.id === m.id)!.category = e.target.value as MistakeCategory; })}
                style={{ width: "auto", minHeight: 36 }}
              >
                {MISTAKE_CATEGORIES.map((c) => <option key={c} value={c}>{MISTAKE_LABEL[c]}</option>)}
              </select>
              <button className="btn small ghost" onClick={() => update((d) => { const x = d.mistakes.find((y) => y.id === m.id)!; x.resolved = !x.resolved; })}>
                {m.resolved ? "ทำเครื่องหมายว่ายังไม่แก้" : "ทำเครื่องหมายว่าแก้แล้ว"}
              </button>
              <button className="btn small ghost" onClick={() => update((d) => { d.mistakes = d.mistakes.filter((x) => x.id !== m.id); })}>ลบ</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function MistakesPage() {
  return (
    <Suspense fallback={<p className="muted">กำลังโหลด…</p>}>
      <MistakesInner />
    </Suspense>
  );
}
