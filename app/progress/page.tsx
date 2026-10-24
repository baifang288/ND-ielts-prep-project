"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import {
  AREA_LABEL, QTYPE_LABEL, SKILLS, accuracyByType, attemptsFor, lessonsCompleted, lessonsTotal, minutesByArea, openMistakeCategories,
  skillSummary, streak, totalMinutes, vocabStats,
} from "@/lib/stats";
import { addDays, formatMinutes, formatThaiDate, startOfWeek, today } from "@/lib/dates";
import { approxBandFromRaw, overallBand } from "@/lib/scoring";
import { BarChart, LineChart } from "@/components/Charts";
import { Empty, OfficialNotice } from "@/components/Bits";
import { MISTAKE_LABEL } from "@/lib/labels";
import type { MockResult, MockSource, Skill } from "@/lib/types";

const SOURCE_LABEL: Record<MockSource, string> = {
  "full-practice-test": "ข้อสอบฝึกเต็มรูปแบบ (40 ข้อ)",
  "official-sample": "ข้อสอบตัวอย่างทางการ (บางส่วน)",
  teacher: "ครู/ผู้ตรวจ",
  "ai-estimate": "ค่าประมาณจาก AI (ไม่เป็นทางการ)",
  "self-assessment": "ประเมินตนเอง",
};

function MockForm() {
  const { update } = useStore();
  const [f, setF] = useState({ date: today(), skill: "listening" as Skill, source: "full-practice-test" as MockSource, raw: "", band: "", notes: "" });
  const [err, setErr] = useState<string | null>(null);
  const lr = f.skill === "listening" || f.skill === "reading";
  const approx = lr && f.source === "full-practice-test" && f.raw !== "" ? approxBandFromRaw(f.skill as "listening" | "reading", Number(f.raw)) : null;

  const save = () => {
    const raw = f.raw === "" ? undefined : Number(f.raw);
    const band = f.band === "" ? undefined : Number(f.band);
    if (raw !== undefined && (!Number.isInteger(raw) || raw < 0 || raw > 40)) return setErr("คะแนนดิบต้องเป็นจำนวนเต็ม 0–40");
    if (band !== undefined && (band < 0 || band > 9 || (band * 2) % 1 !== 0)) return setErr("band ต้องอยู่ระหว่าง 0–9 ทีละ 0.5");
    if (raw === undefined && band === undefined) return setErr("กรอกคะแนนดิบหรือ band อย่างน้อยหนึ่งอย่าง");
    setErr(null);
    update((d) => { d.mocks.push({ id: uid("k"), date: f.date, skill: f.skill, source: f.source, raw, band, notes: f.notes || undefined }); });
    setF({ ...f, raw: "", band: "", notes: "" });
  };

  return (
    <details className="card">
      <summary>+ บันทึกผลสอบฝึก / mock test</summary>
      <p className="small muted" style={{ marginTop: 8 }}>
        บันทึกเฉพาะผลที่ได้จริง เช่น ข้อสอบฝึกเต็มรูปแบบจากหนังสือ/ศูนย์สอบ หรือคะแนนจากครู แบบฝึกสั้นในแอปจะไม่ถูกแปลงเป็น band
      </p>
      <div className="grid grid-3">
        <div className="field"><label htmlFor="m-d">วันที่</label><input id="m-d" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        <div className="field"><label htmlFor="m-s">ทักษะ</label>
          <select id="m-s" value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value as Skill })}>{SKILLS.map((k) => <option key={k} value={k}>{AREA_LABEL[k]}</option>)}</select></div>
        <div className="field"><label htmlFor="m-src">แหล่งที่มา</label>
          <select id="m-src" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as MockSource })}>{(Object.keys(SOURCE_LABEL) as MockSource[]).map((k) => <option key={k} value={k}>{SOURCE_LABEL[k]}</option>)}</select></div>
        {lr && <div className="field"><label htmlFor="m-raw">คะแนนดิบ (/40)</label><input id="m-raw" type="number" min={0} max={40} value={f.raw} onChange={(e) => setF({ ...f, raw: e.target.value })} /></div>}
        <div className="field"><label htmlFor="m-band">Band (ถ้ามี)</label><input id="m-band" type="number" min={0} max={9} step={0.5} value={f.band} onChange={(e) => setF({ ...f, band: e.target.value })} /></div>
        <div className="field"><label htmlFor="m-n">หมายเหตุ</label><input id="m-n" type="text" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      </div>
      {approx !== null && <p className="small">ค่าประมาณจากแนวทางที่เผยแพร่: <b>~{approx}</b> (เฉพาะข้อสอบเต็ม 40 ข้อ · ไม่ใช่คะแนนทางการ)</p>}
      {err && <div className="notice bad small" role="alert">{err}</div>}
      <button className="btn primary" onClick={save}>บันทึกผล</button>
    </details>
  );
}

function bandOf(m: MockResult): number | null {
  if (m.band !== undefined) return m.band;
  if (m.raw !== undefined && m.source === "full-practice-test" && (m.skill === "listening" || m.skill === "reading")) return approxBandFromRaw(m.skill, m.raw);
  return null;
}

export default function ProgressPage() {
  const { state, update } = useStore();
  const s = state;
  const byArea = minutesByArea(s);
  const v = vocabStats(s);
  const cats = openMistakeCategories(s);
  const allCats: Record<string, number> = {};
  for (const m of s.mistakes) allCats[m.category] = (allCats[m.category] ?? 0) + 1;
  const repeated = s.mistakes.filter((m) => m.attempts.filter((a) => !a.ok).length >= 1).length;

  // Weekly minutes, last 8 weeks
  const thisWeek = startOfWeek(today());
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, (i - 7) * 7));
  const weekMinutes = weeks.map((w) => {
    let m = 0;
    for (let d = 0; d < 7; d++) m += s.studyLog[addDays(w, d)]?.minutes ?? 0;
    return m;
  });

  // Latest band per skill (only recorded results)
  const latestBand: Partial<Record<Skill, { band: number; m: MockResult }>> = {};
  for (const m of [...s.mocks].sort((a, b) => a.date.localeCompare(b.date))) {
    const b = bandOf(m);
    if (b !== null) latestBand[m.skill] = { band: b, m };
  }
  const four = SKILLS.map((k) => latestBand[k]?.band);
  const overall = four.every((b) => b !== undefined) ? overallBand(four as number[]) : null;
  const usesAi = SKILLS.some((k) => latestBand[k]?.m.source === "ai-estimate");

  return (
    <div>
      <h1>ความก้าวหน้า</h1>
      <p className="small muted">แสดงเฉพาะข้อมูลที่บันทึกจริงในแอป ผลแบบฝึกสั้นแสดงเป็น % ความแม่นยำ ไม่ใช่ band score</p>

      <div className="grid grid-4">
        <div className="card center"><div className="muted small">เวลาเรียนรวม</div><div className="big">{formatMinutes(totalMinutes(s))}</div></div>
        <div className="card center"><div className="muted small">บทเรียนที่เสร็จ</div><div className="big">{lessonsCompleted(s)}/{lessonsTotal()}</div></div>
        <div className="card center"><div className="muted small">เรียนต่อเนื่อง</div><div className="big">{streak(s)} วัน</div></div>
        <div className="card center"><div className="muted small">แบบฝึกที่ทำ</div><div className="big">{s.attempts.length}</div></div>
      </div>

      <div className="card">
        <h2>เวลาเรียนรายสัปดาห์ (นาที)</h2>
        {weekMinutes.some((m) => m > 0) ? (
          <BarChart title="นาทีที่เรียนต่อสัปดาห์ 8 สัปดาห์ล่าสุด" categories={weeks.map((w) => formatThaiDate(w, false).replace(/ \d{4}$/, ""))} series={[{ name: "นาที", values: weekMinutes, color: "var(--primary)" }]} />
        ) : <p className="muted small">ยังไม่มีเวลาที่บันทึก — ใช้ตัวจับเวลาเพื่อบันทึกเวลาเรียน</p>}
        <p className="small muted">เป้าหมาย {s.settings.dailyMinutes * 7} นาที/สัปดาห์ · {Object.entries(byArea).filter(([, m]) => m).map(([a, m]) => `${AREA_LABEL[a as keyof typeof AREA_LABEL]} ${formatMinutes(m!)}`).join(" · ") || "ยังไม่มีข้อมูลแยกทักษะ"}</p>
      </div>

      <h2>แยกตามทักษะ</h2>
      <div className="grid grid-2">
        {SKILLS.map((k) => {
          const sum = skillSummary(s, k);
          const atts = attemptsFor(s, k).filter((a) => a.source !== "mistake-quiz");
          const types = accuracyByType(s, k);
          return (
            <div key={k} className={`card skill-card skill-${k}`}>
              <h3 className="skill-head">{AREA_LABEL[k]}</h3>
              <p className="small">
                เวลา {formatMinutes(sum.minutes)} · บทเรียน {sum.lessonsDone}/{sum.lessonsTotal}
                {(k === "listening" || k === "reading") && <> · แบบฝึก {atts.length} ครั้ง · ล่าสุด 5 ครั้ง {sum.accuracy === null ? "—" : `${sum.accuracy}%`}</>}
              </p>
              {(k === "listening" || k === "reading") && (atts.length >= 2 ? (
                <LineChart title={`ความแม่นยำ ${AREA_LABEL[k]} ตามเวลา`} labels={atts.map((a) => formatThaiDate(a.date.slice(0, 10), false).replace(/ \d{4}$/, ""))} series={[{ name: "%", values: atts.map((a) => Math.round((a.correct / a.total) * 100)), color: `var(--${k})` }]} max={100} unit="%" />
              ) : <p className="small muted">ต้องทำแบบฝึกอย่างน้อย 2 ครั้งเพื่อแสดงกราฟ</p>)}
              {(k === "listening" || k === "reading") && types.length > 0 && (
                <table><tbody>{types.map((t) => <tr key={t.qtype}><td className="small">{QTYPE_LABEL[t.qtype]}</td><td className="small"><b>{t.pct}%</b> ({t.c}/{t.t})</td></tr>)}</tbody></table>
              )}
              {k === "writing" && (
                <p className="small">
                  ชิ้นงาน {s.drafts.length} · ฉบับแก้ไขรวม {s.drafts.reduce((a, d) => a + d.revisions.length, 0)} · AI feedback {s.drafts.reduce((a, d) => a + d.feedback.length, 0)} ครั้ง
                  <br /><span className="muted">Writing เน้นความก้าวหน้าตามเกณฑ์ (checklist + feedback) แทนคะแนนที่ดูแม่นยำเกินจริง</span>
                </p>
              )}
              {k === "speaking" && (
                <p className="small">
                  ฝึก {s.speaking.length} ครั้ง · Part 1/2/3: {[1, 2, 3].map((p) => s.speaking.filter((x) => x.part === p).length).join("/")} ·
                  Part 2 นานสุด {Math.max(0, ...s.speaking.filter((x) => x.part === 2).map((x) => x.durationSec))} วินาที
                </p>
              )}
              {latestBand[k] && (
                <p className="small">ผลสอบฝึกล่าสุด: <b>{latestBand[k]!.band}</b> <span className="muted">({SOURCE_LABEL[latestBand[k]!.m.source]}, {formatThaiDate(latestBand[k]!.m.date, false)})</span></p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>คำศัพท์</h2>
          <p className="small">ในสมุด {v.total} · จำได้แล้ว {v.learned} · ทบทวน {v.reviewCount} ครั้ง</p>
          <p className="small">อัตราจำได้ระหว่างทบทวน (ไม่ใช่ &quot;ลืม&quot;): <b>{v.retention === null ? "ยังไม่มีข้อมูล" : `${v.retention}%`}</b></p>
          <Link href="/vocabulary" className="small">เปิดสมุดคำศัพท์</Link>
        </div>
        <div className="card">
          <h2>ข้อผิดพลาด</h2>
          <p className="small">ทั้งหมด {s.mistakes.length} · ยังไม่แก้ {s.mistakes.filter((m) => !m.resolved).length} · แก้สำเร็จ {s.mistakes.filter((m) => m.resolved).length} · ผิดซ้ำตอนฝึก {repeated}</p>
          {Object.keys(allCats).length ? (
            <BarChart
              title="จำนวนข้อผิดพลาดตามหมวด"
              categories={Object.entries(allCats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => (MISTAKE_LABEL[c] ?? c).replace(/^(Listening|Reading|Writing|Speaking): /, "").slice(0, 14))}
              series={[{ name: "ครั้ง", values: Object.entries(allCats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([, n]) => n), color: "var(--bad)" }]}
            />
          ) : <p className="small muted">ยังไม่มีข้อมูล</p>}
          {cats[0] && <p className="small">หมวดที่ควรเน้น: <b>{MISTAKE_LABEL[cats[0].category] ?? cats[0].category}</b></p>}
        </div>
      </div>

      <div className="card">
        <h2>ผลสอบฝึก (Mock tests)</h2>
        <MockForm />
        {s.mocks.length ? (
          <>
            {overall !== null && (
              <div className="notice info small">
                Overall จากผลล่าสุดของแต่ละทักษะ (ค่าเฉลี่ยปัดตามกฎ IELTS): <b>{overall}</b>
                {usesAi && " · มีค่าประมาณจาก AI รวมอยู่ด้วย จึงเป็นเพียงการประมาณที่ไม่เป็นทางการ"}
                {" "}— เป้าหมาย 6.5 และไม่มีทักษะใดต่ำกว่า 6.0 {Math.min(...(four as number[])) < 6 && "(ยังมีทักษะต่ำกว่า 6.0)"}
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>วันที่</th><th>ทักษะ</th><th>แหล่ง</th><th>คะแนนดิบ</th><th>Band</th><th></th></tr></thead>
                <tbody>
                  {[...s.mocks].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
                    <tr key={m.id}>
                      <td className="small">{formatThaiDate(m.date, false)}</td>
                      <td className="small">{AREA_LABEL[m.skill]}</td>
                      <td className="small">{SOURCE_LABEL[m.source]}{m.notes && <div className="muted">{m.notes}</div>}</td>
                      <td className="small">{m.raw !== undefined ? `${m.raw}/40` : "—"}</td>
                      <td className="small">
                        {m.band !== undefined ? <b>{m.band}</b> : bandOf(m) !== null ? <>~{bandOf(m)} <span className="muted">(ประมาณ)</span></> : "—"}
                      </td>
                      <td><button className="btn small ghost" onClick={() => update((d) => { d.mocks = d.mocks.filter((x) => x.id !== m.id); })}>ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <OfficialNotice kind="estimate" />
          </>
        ) : (
          <Empty>ยังไม่มีผลสอบฝึก — แนะนำให้เริ่มทำข้อสอบเต็มรูปแบบใน Phase 4 (เดือนที่ 7–8)</Empty>
        )}
      </div>
    </div>
  );
}
