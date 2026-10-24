"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { READING, allQuestions } from "@/data/reading";
import { RESOURCES } from "@/data/resources";
import { accuracyByType, attemptsFor, QTYPE_LABEL, recentAccuracy } from "@/lib/stats";

export default function ReadingHome() {
  const { state } = useStore();
  const acc = recentAccuracy(state, "reading");
  const types = accuracyByType(state, "reading");
  const ext = RESOURCES.filter((r) => r.skills.includes("reading"));

  return (
    <div className="skill-reading">
      <h1 className="skill-head">Reading</h1>
      <p className="small muted">เริ่มจากบทอ่านระดับ B1 แล้วค่อยขยับไปแบบ IELTS-style ทุกบทเป็นต้นฉบับของแอป ไม่ใช่ข้อสอบทางการ คำตอบทุกข้อมีหลักฐานจากบทความ</p>
      <div className="grid grid-2">
        <div className="card skill-card">
          <div className="muted small">ความแม่นยำ 5 ครั้งล่าสุด</div>
          <div className="big">{acc === null ? "—" : `${acc}%`}</div>
          <div className="small muted">{attemptsFor(state, "reading").length} ครั้งที่ทำ (รวมแบบฝึกในบทเรียน)</div>
        </div>
        <div className="card skill-card">
          <div className="muted small">ความแม่นยำตามประเภทคำถาม</div>
          {types.length ? (
            <table><tbody>{types.map((t) => <tr key={t.qtype}><td className="small">{QTYPE_LABEL[t.qtype]}</td><td className="small"><b>{t.pct}%</b> ({t.c}/{t.t})</td></tr>)}</tbody></table>
          ) : <div className="muted small">ยังไม่มีข้อมูล</div>}
        </div>
      </div>

      <h2>บทอ่าน</h2>
      <div className="grid grid-2">
        {READING.map((p) => {
          const att = state.attempts.filter((a) => a.refId === p.id);
          const last = att[att.length - 1];
          const kinds = [...new Set(allQuestions(p).map((q) => QTYPE_LABEL[q.qtype]))];
          return (
            <Link key={p.id} href={`/reading/${p.id}`} className="card skill-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="spread"><b className="en">{p.id}. {p.title}</b><span className="badge skill-chip">{p.level}</span></div>
              <p className="small" style={{ margin: "4px 0" }}>{p.focusTh}</p>
              <div className="small muted">{kinds.join(" · ")}</div>
              <div className="small muted">{allQuestions(p).length} ข้อ · {p.minutes} นาที · {last ? `ล่าสุด ${last.correct}/${last.total}` : "ยังไม่ได้ทำ"}</div>
            </Link>
          );
        })}
      </div>

      <h2>แหล่งฝึกอ่านเพิ่มเติม</h2>
      <div className="card">
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {ext.map((r) => (
            <li key={r.url} style={{ marginBottom: 6 }}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>{" "}
              <span className={`badge ${r.official ? "ok" : ""}`}>{r.official ? "ทางการ (ielts.org)" : `${r.provider} · ภายนอก`}</span>
              <div className="small muted">{r.descriptionTh}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
