"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useStore, uid } from "@/lib/store";
import { CHECKLISTS, WRITING_PROMPTS, type WritingPrompt } from "@/data/writing";
import WritingVisual, { visualSummary } from "@/components/WritingVisual";
import AiFeedback from "@/components/AiFeedback";
import { AiUnavailable, OfficialNotice } from "@/components/Bits";
import { askAI, useAiStatus } from "@/lib/ai-client";
import { countWords } from "@/lib/check";
import { ruleCheck, type RuleFinding } from "@/lib/writing-checks";
import { addMistake, setLastLocation } from "@/lib/actions";
import { formatThaiDate } from "@/lib/dates";
import { MISTAKE_CATEGORIES, MISTAKE_LABEL } from "@/lib/labels";
import type { MistakeCategory, WritingDraft } from "@/lib/types";

const TASK_LABEL = { 0: "ฝึกเขียนย่อหน้า", 1: "Academic Task 1", 2: "Task 2 (Essay)" } as const;

function externalPrompt(p: WritingPrompt, text: string, visual?: string) {
  return `You are an IELTS Academic writing tutor. I am a Thai learner at CEFR B1.
Please explain in Thai, keep corrections in English.
1) First analyse MY original text: strengths, then the most important errors (quote → correction → Thai explanation → error category).
2) Comment on ${p.task === 1 ? "Task Achievement" : p.task === 2 ? "Task Response" : "task completion"}, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.
3) If you estimate a band, call it an unofficial estimate and give a range. Do not estimate if my text is too short.
4) Give 2–3 revision exercises based on my mistakes.
5) Only after that, improve one paragraph of my text while keeping my ideas.

Task: ${p.prompt}
${visual ? `Data: ${visual}\n` : ""}Word count: ${countWords(text)}

My text:
"""
${text || "(paste your text here)"}
"""`;
}

function WritingInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, update } = useStore();
  const ai = useAiStatus();
  const promptId = params.get("prompt") ?? "";
  const p = WRITING_PROMPTS.find((x) => x.id === promptId);
  const draft = state.drafts.find((d) => d.promptId === promptId);
  const [text, setText] = useState(draft?.text ?? "");
  const [findings, setFindings] = useState<RuleFinding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewRev, setViewRev] = useState<number | null>(null);
  const [manual, setManual] = useState({ original: "", corrected: "", explanationTh: "", category: "verb-tense" as MistakeCategory });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setText(state.drafts.find((d) => d.promptId === promptId)?.text ?? "");
    setFindings(null);
    setError(null);
    if (p) update((d) => setLastLocation(d, `/writing?prompt=${p.id}`, `Writing: ${p.title}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  // Autosave the working text (debounced).
  useEffect(() => {
    if (!p) return;
    if ((draft?.text ?? "") === text) return;
    const t = setTimeout(() => {
      update((d) => {
        let dr = d.drafts.find((x) => x.promptId === p.id);
        if (!dr) {
          if (!text.trim()) return;
          dr = { id: uid("w"), promptId: p.id, task: p.task, title: p.title, text: "", updatedAt: "", revisions: [], feedback: [], checklist: {} } as WritingDraft;
          d.drafts.unshift(dr);
        }
        dr.text = text;
        dr.updatedAt = new Date().toISOString();
      });
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, p?.id]);

  const words = countWords(text);
  const vSummary = useMemo(() => (p?.visual ? visualSummary(p.visual) : undefined), [p]);

  if (!p) {
    const groups = [0, 1, 2] as const;
    return (
      <div className="skill-writing">
        <h1 className="skill-head">Writing</h1>
        <p className="small muted">เลือกโจทย์เพื่อเปิดตัวแก้ไข งานเขียนบันทึกอัตโนมัติ และเก็บประวัติทุกฉบับที่กด &quot;บันทึกเป็นฉบับใหม่&quot; โจทย์และข้อมูลทั้งหมดเป็นต้นฉบับของแอป</p>
        {groups.map((g) => (
          <div key={g}>
            <h2>{TASK_LABEL[g]}</h2>
            <div className="grid grid-2">
              {WRITING_PROMPTS.filter((x) => x.task === g).map((x) => {
                const dr = state.drafts.find((d) => d.promptId === x.id);
                return (
                  <Link key={x.id} href={`/writing?prompt=${x.id}`} className="card skill-card" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="spread"><b className="en">{x.title}</b><span className="badge skill-chip">{x.kind}</span></div>
                    <div className="small muted">
                      {dr ? `${dr.revisions.length} ฉบับ · feedback ${dr.feedback.length} ครั้ง · แก้ล่าสุด ${formatThaiDate(dr.updatedAt.slice(0, 10), false)}` : "ยังไม่ได้เริ่ม"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const checklist = CHECKLISTS[p.task];
  const saveRevision = () => {
    update((d) => {
      let dr = d.drafts.find((x) => x.promptId === p.id);
      if (!dr) {
        dr = { id: uid("w"), promptId: p.id, task: p.task, title: p.title, text, updatedAt: new Date().toISOString(), revisions: [], feedback: [], checklist: {} };
        d.drafts.unshift(dr);
      }
      dr.text = text;
      dr.revisions.push({ at: new Date().toISOString(), text, words });
    });
    setSavedMsg("บันทึกเป็นฉบับใหม่แล้ว");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const runRules = () => {
    const f = ruleCheck(text, p.task, p.minWords);
    setFindings(f);
  };

  const requestAI = async () => {
    setError(null);
    setLoading(true);
    // make sure the version that gets feedback is in the revision history
    const lastRev = draft?.revisions[draft.revisions.length - 1];
    if (!lastRev || lastRev.text !== text) saveRevision();
    const res = await askAI("writing-feedback", { text, taskNo: p.task, prompt: p.prompt, visualSummary: vSummary, words }, state.settings.accessCode);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    update((d) => {
      const dr = d.drafts.find((x) => x.promptId === p.id)!;
      dr.feedback.push({ at: new Date().toISOString(), kind: "ai", model: res.model, text: res.text, forRevisionAt: dr.revisions[dr.revisions.length - 1]?.at ?? "" });
    });
  };

  const latestFeedback = draft?.feedback[draft.feedback.length - 1];

  return (
    <div className="skill-writing">
      <p className="small"><button className="btn small ghost" onClick={() => router.push("/writing")}>← โจทย์ทั้งหมด</button></p>
      <div className="spread">
        <h1 className="en">{p.title}</h1>
        <span className="badge skill-chip">{TASK_LABEL[p.task]} · {p.kind}</span>
      </div>

      <div className="split">
        <div>
          <div className="card skill-card">
            <p className="en" style={{ whiteSpace: "pre-wrap" }}>{p.prompt}</p>
            <p className="small muted">อย่างน้อย {p.minWords} คำ · แนะนำ {p.suggestedMinutes} นาที</p>
          </div>
          {p.visual && <WritingVisual v={p.visual} />}
          <details className="card">
            <summary>วางแผนก่อนเขียน (ภาษาไทย)</summary>
            <ul style={{ margin: "0.5rem 0 0 1.2rem", padding: 0 }}>{p.planningTh.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="small" style={{ marginTop: 8 }}><b>ภาษาที่ใช้ได้:</b></p>
            <ul className="en small" style={{ margin: "0 0 0 1.2rem", padding: 0 }}>{p.usefulLanguage.map((x) => <li key={x}>{x}</li>)}</ul>
          </details>
          <div className="card">
            <h3>Checklist ตามเกณฑ์</h3>
            {checklist.map((c) => (
              <label key={c.id} className="checkline">
                <input
                  type="checkbox"
                  checked={!!draft?.checklist[c.id]}
                  disabled={!draft}
                  onChange={(e) => update((d) => { const dr = d.drafts.find((x) => x.promptId === p.id); if (dr) dr.checklist[c.id] = e.target.checked; })}
                />
                <span><span className="en">{c.label}</span><br /><span className="small muted">{c.hintTh}</span></span>
              </label>
            ))}
            {!draft && <p className="small muted">เริ่มพิมพ์เพื่อเปิดใช้ checklist</p>}
          </div>
        </div>

        <div>
          <div className="card">
            <label htmlFor="editor">งานเขียนของฉัน</label>
            <textarea id="editor" className="editor" value={text} onChange={(e) => setText(e.target.value)} placeholder="Start writing here…" spellCheck={false} />
            <div className="spread small" style={{ marginTop: 6 }}>
              <span className={words >= p.minWords ? "badge ok" : "badge warn"}>{words} / {p.minWords} คำ</span>
              <span className="muted">{draft?.updatedAt ? "บันทึกอัตโนมัติแล้ว" : ""}</span>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn" onClick={saveRevision} disabled={!text.trim()}>บันทึกเป็นฉบับใหม่</button>
              <button className="btn" onClick={runRules} disabled={!text.trim()}>ตรวจเบื้องต้น (ไม่ใช้ AI)</button>
              {ai.configured && (
                <button className="btn primary" onClick={requestAI} disabled={loading || words < 20}>{loading ? "กำลังวิเคราะห์…" : "ขอ feedback จาก AI"}</button>
              )}
            </div>
            {savedMsg && <p className="small" role="status">{savedMsg}</p>}
            {ai.configured && words < 20 && <p className="small muted">ต้องมีอย่างน้อย 20 คำจึงจะขอ feedback ได้</p>}
            {error && <div className="notice bad small" role="alert" style={{ marginTop: 8 }}>{error}</div>}
          </div>

          {!ai.configured && <AiUnavailable status={ai} prompt={externalPrompt(p, text, vSummary)} />}

          {findings && (
            <div className="card">
              <h3>ผลตรวจเบื้องต้น (ตามกฎ ไม่ใช้ AI)</h3>
              <p className="small muted">ตรวจรูปแบบข้อผิดพลาดที่พบบ่อยเท่านั้น ไม่ได้ตรวจความหมายหรือไวยากรณ์ทั้งหมด และอาจเตือนผิดได้</p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {findings.map((f, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <span className={`badge ${f.level === "warn" ? "warn" : "info"}`}>{f.level === "warn" ? "ควรแก้" : "ข้อสังเกต"}</span> {f.th}
                    {f.quote && <div className="small en muted">“{f.quote}”</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latestFeedback && (
            <div className="card">
              <h3>Feedback ล่าสุด ({formatThaiDate(latestFeedback.at.slice(0, 10), false)})</h3>
              <AiFeedback text={latestFeedback.text} skill="writing" source={`writing:${p.id}`} model={latestFeedback.model} />
            </div>
          )}

          <div className="card">
            <h3>บันทึกข้อผิดพลาดเอง</h3>
            <p className="small muted">ใช้เมื่อได้ feedback จากครูหรือ AI ภายนอก</p>
            <div className="field"><label htmlFor="m-o">ประโยคเดิม</label><input id="m-o" type="text" className="en" value={manual.original} onChange={(e) => setManual({ ...manual, original: e.target.value })} /></div>
            <div className="field"><label htmlFor="m-c">ประโยคที่ถูก</label><input id="m-c" type="text" className="en" value={manual.corrected} onChange={(e) => setManual({ ...manual, corrected: e.target.value })} /></div>
            <div className="field"><label htmlFor="m-e">คำอธิบาย (ภาษาไทย)</label><input id="m-e" type="text" value={manual.explanationTh} onChange={(e) => setManual({ ...manual, explanationTh: e.target.value })} /></div>
            <div className="field">
              <label htmlFor="m-cat">หมวด</label>
              <select id="m-cat" value={manual.category} onChange={(e) => setManual({ ...manual, category: e.target.value as MistakeCategory })}>
                {MISTAKE_CATEGORIES.map((c) => <option key={c} value={c}>{MISTAKE_LABEL[c]}</option>)}
              </select>
            </div>
            <button
              className="btn"
              disabled={!manual.original.trim() || !manual.corrected.trim()}
              onClick={() => {
                update((d) => { addMistake(d, { ...manual, skill: "writing", source: `writing:${p.id}`, practice: `Correct this sentence: ${manual.original}` }); });
                setManual({ ...manual, original: "", corrected: "", explanationTh: "" });
              }}
            >
              บันทึกลงสมุดข้อผิดพลาด
            </button>
          </div>

          {draft && draft.revisions.length > 0 && (
            <div className="card">
              <h3>ประวัติการแก้ไข ({draft.revisions.length} ฉบับ)</h3>
              <table>
                <tbody>
                  {draft.revisions.map((r, i) => (
                    <tr key={r.at}>
                      <td className="small">ฉบับที่ {i + 1}</td>
                      <td className="small">{formatThaiDate(r.at.slice(0, 10), false)} · {r.words} คำ{draft.feedback.some((f) => f.forRevisionAt === r.at) && <span className="badge info" style={{ marginLeft: 4 }}>มี feedback</span>}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn small ghost" onClick={() => setViewRev(viewRev === i ? null : i)}>{viewRev === i ? "ซ่อน" : "ดู"}</button>
                        <button className="btn small ghost" onClick={() => setText(r.text)}>นำกลับมาแก้</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewRev !== null && <pre className="en small" style={{ whiteSpace: "pre-wrap", background: "var(--surface-2)", padding: 8, borderRadius: 8 }}>{draft.revisions[viewRev].text}</pre>}
              {draft.feedback.length > 1 && (
                <details>
                  <summary className="small">feedback ก่อนหน้า ({draft.feedback.length - 1})</summary>
                  {draft.feedback.slice(0, -1).reverse().map((f) => (
                    <div key={f.at} className="card small"><b>{formatThaiDate(f.at.slice(0, 10), false)}</b><div className="ai-output">{f.text}</div></div>
                  ))}
                </details>
              )}
            </div>
          )}
          <OfficialNotice kind="ai" />
        </div>
      </div>
    </div>
  );
}

export default function WritingPage() {
  return (
    <Suspense fallback={<p className="muted">กำลังโหลด…</p>}>
      <WritingInner />
    </Suspense>
  );
}
