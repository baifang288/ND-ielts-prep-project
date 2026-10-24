"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { LISTENING } from "@/data/listening";
import { RESOURCES } from "@/data/resources";
import { accuracyByType, attemptsFor, QTYPE_LABEL, recentAccuracy } from "@/lib/stats";
import { MISTAKE_LABEL } from "@/lib/labels";

export default function ListeningHome() {
  const { state } = useStore();
  const acc = recentAccuracy(state, "listening");
  const types = accuracyByType(state, "listening");
  const reasons: Record<string, number> = {};
  for (const m of state.mistakes) if (m.skill === "listening") reasons[m.category] = (reasons[m.category] ?? 0) + 1;
  const ext = RESOURCES.filter((r) => r.skills.includes("listening") && !r.official);

  return (
    <div className="skill-listening">
      <h1 className="skill-head">Listening</h1>
      <p className="small muted">
        เสียงในแบบฝึกเหล่านี้สร้างจากเสียงสังเคราะห์ของเบราว์เซอร์ (Text-to-Speech) จากสคริปต์ต้นฉบับของแอป ใช้ได้อย่างถูกต้องตามกฎหมาย
        แต่สำเนียงและจังหวะไม่เหมือนข้อสอบจริง — ใช้คู่กับเสียงจริงจาก British Council / BBC ด้านล่าง
      </p>
      <div className="grid grid-3">
        <div className="card skill-card"><div className="muted small">ความแม่นยำ 5 ครั้งล่าสุด</div><div className="big">{acc === null ? "—" : `${acc}%`}</div><div className="small muted">{attemptsFor(state, "listening").length} ครั้งที่ทำ</div></div>
        <div className="card skill-card">
          <div className="muted small">ประเภทคำถามที่อ่อนที่สุด</div>
          {types.length ? <div><b>{QTYPE_LABEL[types[0].qtype]}</b> {types[0].pct}% <span className="muted small">({types[0].c}/{types[0].t})</span></div> : <div className="muted small">ยังไม่มีข้อมูล</div>}
        </div>
        <div className="card skill-card">
          <div className="muted small">สาเหตุที่ผิดบ่อย</div>
          {Object.keys(reasons).length ? (
            <ul className="small" style={{ margin: 0, paddingLeft: "1rem" }}>
              {Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => <li key={k}>{MISTAKE_LABEL[k] ?? k}: {n}</li>)}
            </ul>
          ) : <div className="muted small">ยังไม่มีข้อมูล</div>}
        </div>
      </div>

      <h2>แบบฝึก (ต้นฉบับของแอป)</h2>
      <div className="grid grid-2">
        {LISTENING.map((ex) => {
          const att = state.attempts.filter((a) => a.refId === ex.id);
          const last = att[att.length - 1];
          return (
            <Link key={ex.id} href={`/listening/${ex.id}`} className="card skill-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="spread"><b className="en">{ex.id}. {ex.title}</b><span className="badge skill-chip">{ex.level}</span></div>
              <p className="small" style={{ margin: "4px 0" }}>{ex.focusTh}</p>
              <div className="small muted">{ex.questions.length} ข้อ · {last ? `ล่าสุด ${last.correct}/${last.total}` : "ยังไม่ได้ทำ"}</div>
            </Link>
          );
        })}
      </div>

      <h2>ฝึกฟังเสียงจริง (แหล่งภายนอก)</h2>
      <div className="card">
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {ext.map((r) => (
            <li key={r.url} style={{ marginBottom: 6 }}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> <span className="badge">{r.provider} · ภายนอก</span>
              <div className="small muted">{r.descriptionTh}</div>
            </li>
          ))}
        </ul>
        <p className="small muted" style={{ marginTop: 8 }}>ข้อสอบ Listening ตัวอย่างทางการอยู่ในหน้า <Link href="/resources">แหล่งเรียนรู้ฟรี</Link> (ใช้ใน Phase 3 เป็นต้นไป)</p>
      </div>
    </div>
  );
}
