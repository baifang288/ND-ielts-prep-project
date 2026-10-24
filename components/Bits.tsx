"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { addVocab, hasVocab } from "@/lib/actions";
import type { VocabSeed } from "@/lib/types";
import type { AiStatus } from "@/lib/ai-client";

export function AddVocabButton({ v, source }: { v: VocabSeed; source?: string }) {
  const { state, update } = useStore();
  const exists = hasVocab(state, v.en);
  return (
    <button
      className="btn small"
      disabled={exists}
      onClick={() => update((d) => { addVocab(d, { ...v, source }); })}
      aria-label={exists ? `${v.en} อยู่ในสมุดแล้ว` : `เพิ่ม ${v.en} ลงสมุดคำศัพท์`}
    >
      {exists ? "✓ อยู่ในสมุดแล้ว" : "+ สมุดคำศัพท์"}
    </button>
  );
}

export function VocabList({ items, source }: { items: VocabSeed[]; source?: string }) {
  const { update } = useStore();
  if (!items.length) return null;
  return (
    <div>
      <div className="spread">
        <h3>คำศัพท์จากแบบฝึกนี้</h3>
        <button className="btn small" onClick={() => update((d) => { items.forEach((v) => addVocab(d, { ...v, source })); })}>
          เพิ่มทั้งหมด
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            {items.map((v) => (
              <tr key={v.en}>
                <td className="en"><b>{v.en}</b>{v.ipa && <div className="muted small">{v.ipa}</div>}</td>
                <td>{v.th}<div className="muted small en">{v.example}</div></td>
                <td style={{ width: 1 }}><AddVocabButton v={v} source={source} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficialNotice({ kind }: { kind: "original" | "ai" | "estimate" }) {
  if (kind === "original")
    return <p className="small muted">แบบฝึกนี้เขียนขึ้นใหม่สำหรับแอปนี้ ไม่ใช่ข้อสอบ IELTS ทางการ ผลเป็นความแม่นยำ (%) ไม่ใช่ band score</p>;
  if (kind === "ai")
    return <p className="small muted">Feedback จาก AI เป็นการประเมินโดยประมาณ <b>ไม่ใช่คะแนน IELTS ทางการ</b> และอาจผิดพลาดได้ ใช้เพื่อการเรียนรู้เท่านั้น</p>;
  return <p className="small muted">ค่าประมาณจากแนวทางที่เผยแพร่ (เฉพาะข้อสอบเต็ม 40 ข้อ) ไม่ใช่คะแนนทางการ</p>;
}

export function AiUnavailable({ status, prompt }: { status: AiStatus; prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="notice info">
      <p style={{ marginBottom: "0.5rem" }}>
        <b>{status.checked ? "ยังไม่ได้ตั้งค่า AI บนเซิร์ฟเวอร์" : "กำลังตรวจสถานะ AI…"}</b> — ใช้ได้ 2 ทาง:
      </p>
      <ol style={{ margin: "0 0 0.5rem 1.2rem", padding: 0 }}>
        <li>ใช้ checklist และ &quot;ตรวจเบื้องต้น&quot; ในหน้านี้ (ทำงานได้โดยไม่ต้องใช้ AI)</li>
        <li>คัดลอกคำสั่งด้านล่างไปวางใน AI assistant ภายนอก (เช่น Claude) แล้วนำคำอธิบายที่ได้กลับมาจดในสมุดข้อผิดพลาด</li>
      </ol>
      <details>
        <summary>ดูคำสั่งที่จะคัดลอก</summary>
        <pre className="small en" style={{ whiteSpace: "pre-wrap" }}>{prompt}</pre>
      </details>
      <div className="row" style={{ marginTop: "0.5rem" }}>
        <button className="btn small" onClick={copy}>{copied ? "คัดลอกแล้ว ✓" : "คัดลอกคำสั่งสำหรับ AI ภายนอก"}</button>
        <Link className="btn small ghost" href="/settings#ai">วิธีตั้งค่า AI</Link>
      </div>
    </div>
  );
}

export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <div>{children}</div>
      {action && <div style={{ marginTop: "0.75rem" }}>{action}</div>}
    </div>
  );
}

export function Bar({ pct, label }: { pct: number; label: string }) {
  return <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}><span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}
