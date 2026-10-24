"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { LESSONS } from "@/data/lessons";
import { PHASES, WEEKS_5_8 } from "@/data/roadmap";
import { AREA_LABEL, lessonDate, lessonStatus, phaseCriteria } from "@/lib/stats";
import { addDays, formatMonthYear, formatThaiDate, today } from "@/lib/dates";

const STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: "เสร็จแล้ว", cls: "ok" },
  skipped: { label: "ข้าม", cls: "" },
  overdue: { label: "ค้าง", cls: "warn" },
  today: { label: "วันนี้", cls: "info" },
  upcoming: { label: "ยังไม่ถึง", cls: "" },
};

function phaseSchedule(start: string, months: number) {
  const factor = months / 9;
  let cursor = start;
  return PHASES.map((p) => {
    const weeks = Math.round(p.weeks * factor);
    const from = cursor;
    const to = addDays(cursor, weeks * 7 - 1);
    cursor = addDays(to, 1);
    return { ...p, from, to, weeksScaled: weeks };
  });
}

export default function PlanPage() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<"weeks" | "roadmap">("weeks");
  const [moving, setMoving] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(today());

  const schedule = phaseSchedule(state.settings.startDate, state.settings.planMonths);
  const current = state.phase.current;
  const criteria = phaseCriteria(state, current);
  const allMet = criteria.every((c) => c.met);
  const currentSched = schedule[current - 1];
  const behind = today() > currentSched.to && !allMet;

  return (
    <div>
      <h1>แผนการเรียน</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "weeks"} onClick={() => setTab("weeks")}>4 สัปดาห์แรก (รายวัน)</button>
        <button role="tab" aria-selected={tab === "roadmap"} onClick={() => setTab("roadmap")}>แผนระยะยาว {state.settings.planMonths} เดือน</button>
      </div>

      {tab === "weeks" && (
        <div>
          <p className="small muted">
            แต่ละวันใช้เวลา {state.settings.dailyMinutes} นาที: เรียน/ทบทวนเนื้อหา → ทำแบบฝึก → ตรวจคำตอบและข้อผิดพลาด
            ทุกสัปดาห์มีครบทั้ง 4 ทักษะ และวันอาทิตย์เป็นวันทบทวน กด &quot;เลื่อนวัน&quot; เพื่อย้ายบทเรียนไปวันอื่น
          </p>
          {[1, 2, 3, 4].map((w) => (
            <div className="card" key={w}>
              <h2>สัปดาห์ที่ {w}</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>วัน</th><th>บทเรียน</th><th>สถานะ</th><th></th></tr></thead>
                  <tbody>
                    {LESSONS.filter((l) => l.week === w).map((l) => {
                      const st = lessonStatus(state, l);
                      const d = lessonDate(state, l);
                      return (
                        <tr key={l.id}>
                          <td className="small" style={{ whiteSpace: "nowrap" }}>
                            {formatThaiDate(d)}
                            {state.reschedule[l.id] && <div className="muted">(เลื่อนแล้ว)</div>}
                          </td>
                          <td>
                            <span className="badge">{AREA_LABEL[l.area]}</span>{" "}
                            <Link href={`/lesson/${l.id}`} className="en">{l.title}</Link>
                            <div className="small muted">{l.objectiveTh}</div>
                          </td>
                          <td><span className={`badge ${STATUS[st].cls}`}>{STATUS[st].label}</span></td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {moving === l.id ? (
                              <div className="row">
                                <input type="date" value={newDate} min={state.settings.startDate} onChange={(e) => setNewDate(e.target.value)} aria-label="วันใหม่" style={{ width: 160 }} />
                                <button className="btn small primary" disabled={!newDate} onClick={() => { update((s) => { s.reschedule[l.id] = newDate; }); setMoving(null); }}>บันทึก</button>
                                <button className="btn small" onClick={() => setMoving(null)}>ยกเลิก</button>
                              </div>
                            ) : (
                              <div className="row">
                                {!state.lessons[l.id] && <button className="btn small" onClick={() => { setMoving(l.id); setNewDate(d > today() ? d : today()); }}>เลื่อนวัน</button>}
                                {state.reschedule[l.id] && !state.lessons[l.id] && (
                                  <button className="btn small ghost" onClick={() => update((s) => { delete s.reschedule[l.id]; })}>คืนวันเดิม</button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="card">
            <h2>สัปดาห์ที่ 5–8 (โครงร่าง)</h2>
            <p className="small muted">บทเรียนละเอียดของสัปดาห์ที่ 5 เป็นต้นไปยังไม่ได้สร้างในเวอร์ชันนี้ ใช้โครงร่างนี้ร่วมกับแบบฝึกในแต่ละทักษะและแหล่งเรียนรู้ฟรี</p>
            {WEEKS_5_8.map((w) => (
              <div key={w.week} style={{ marginBottom: "0.75rem" }}>
                <b>สัปดาห์ที่ {w.week}: {w.themeTh}</b>
                <ul style={{ margin: "0.25rem 0 0 1.2rem", padding: 0 }} className="small">{w.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div>
          <div className="card">
            <div className="spread">
              <div>
                <b>ระยะเวลาแผน</b>
                <div className="small muted">เริ่ม {formatThaiDate(state.settings.startDate, false)} · ขยายได้ถึง 12 เดือนถ้ายังไม่พร้อม</div>
              </div>
              <select
                aria-label="ระยะเวลาแผน (เดือน)"
                value={state.settings.planMonths}
                onChange={(e) => update((s) => { s.settings.planMonths = Number(e.target.value); })}
                style={{ width: "auto" }}
              >
                {[9, 10, 11, 12].map((m) => <option key={m} value={m}>{m} เดือน</option>)}
              </select>
            </div>
          </div>

          <div className="card" style={{ borderColor: "var(--primary)" }}>
            <h2>Phase ปัจจุบัน: {current}. {PHASES[current - 1].titleTh}</h2>
            <p className="small muted">
              แอปจะไม่เลื่อน Phase ให้อัตโนมัติเพียงเพราะครบเดือน คุณเลื่อนได้เมื่อผ่านเกณฑ์ทุกข้อเท่านั้น
              {current >= 3 && " (เกณฑ์บางข้อใช้ผลข้อสอบเต็มรูปแบบที่คุณบันทึกในหน้า ความก้าวหน้า)"}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem" }}>
              {criteria.map((c) => (
                <li key={c.label} className="row" style={{ padding: "0.25rem 0" }}>
                  <span className={`badge ${c.met ? "ok" : "warn"}`}>{c.met ? "ผ่าน" : "ยังไม่ผ่าน"}</span>
                  <span>{c.label}</span>
                  <span className="muted small">({c.detail})</span>
                </li>
              ))}
            </ul>
            {behind && (
              <div className="notice warn small">
                ช่วงเวลาที่วางไว้สำหรับ Phase นี้ผ่านไปแล้วแต่ยังไม่ผ่านเกณฑ์ — เป็นเรื่องปกติ อยู่ใน Phase นี้ต่อ และพิจารณาขยายแผนเป็น {Math.min(12, state.settings.planMonths + 1)} เดือน
              </div>
            )}
            {current < 5 ? (
              <button
                className="btn primary"
                disabled={!allMet}
                onClick={() => update((s) => { s.phase.advancedAt[String(current)] = today(); s.phase.current = current + 1; })}
              >
                ไป Phase {current + 1}
              </button>
            ) : (
              <p className="small">
                {allMet
                  ? "ผลฝึกเต็มรูปแบบสม่ำเสมอแล้ว — พิจารณาจองสอบจริงได้ (ตรวจวันสอบและค่าสอบที่ ielts.org หรือศูนย์สอบ)"
                  : "ยังไม่แนะนำให้จองสอบ — ผลฝึกเต็มรูปแบบยังไม่สม่ำเสมอพอ ขยายแผนและฝึกทักษะที่อ่อนที่สุดต่อ"}
              </p>
            )}
            {current > 1 && (
              <button className="btn small ghost" onClick={() => update((s) => { s.phase.current = current - 1; })}>กลับไป Phase {current - 1}</button>
            )}
          </div>

          {schedule.map((p) => (
            <div className="card" key={p.n} style={p.n === current ? { borderLeft: "4px solid var(--primary)" } : undefined}>
              <div className="spread">
                <h3>Phase {p.n}: {p.titleTh} <span className="muted en small">({p.title})</span></h3>
                <span className="badge">{p.n < current ? "ผ่านแล้ว" : p.n === current ? "กำลังเรียน" : "ยังไม่เริ่ม"}</span>
              </div>
              <p className="small muted">
                {p.months} · ประมาณ {p.weeksScaled} สัปดาห์ ({formatMonthYear(p.from)} – {formatMonthYear(p.to)})
              </p>
              <ul className="small en" style={{ margin: "0 0 0.5rem 1.2rem", padding: 0 }}>{p.focus.map((f) => <li key={f}>{f}</li>)}</ul>
              <details>
                <summary className="small">เกณฑ์ผ่าน Phase นี้</summary>
                <ul className="small" style={{ margin: "0.25rem 0 0 1.2rem", padding: 0 }}>{p.exitCriteriaTh.map((c) => <li key={c}>{c}</li>)}</ul>
              </details>
            </div>
          ))}
          <p className="small muted">วันสอบเป้าหมายตอนนี้: {formatThaiDate(state.settings.examDate, false)} — ถ้าแผนขยายจนเลยวันนี้ ให้เปลี่ยนวันสอบในหน้า <Link href="/settings">ตั้งค่า</Link></p>
        </div>
      )}
    </div>
  );
}
