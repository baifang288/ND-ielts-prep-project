"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { lessonById, LESSONS } from "@/data/lessons";
import { AREA_LABEL, lessonDate, lessonStatus } from "@/lib/stats";
import { formatThaiDate, today } from "@/lib/dates";
import { mistakesFromGraded, recordAttempt, setLastLocation } from "@/lib/actions";
import Quiz from "@/components/Quiz";
import { Empty, VocabList } from "@/components/Bits";
import type { Skill } from "@/lib/types";

const SKILL_CLASS: Partial<Record<string, string>> = { listening: "skill-listening", reading: "skill-reading", writing: "skill-writing", speaking: "skill-speaking" };

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, update } = useStore();
  const lesson = lessonById(id);
  const [note, setNote] = useState(state.lessons[id]?.note ?? "");
  const [moving, setMoving] = useState(false);
  const [newDate, setNewDate] = useState(today());

  useEffect(() => {
    if (lesson) update((d) => setLastLocation(d, `/lesson/${lesson.id}`, `วันที่ ${lesson.day}: ${lesson.title}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!lesson) return <Empty action={<Link className="btn" href="/plan">กลับไปแผนการเรียน</Link>}>ไม่พบบทเรียนนี้</Empty>;

  const rec = state.lessons[lesson.id];
  const st = lessonStatus(state, lesson);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[idx + 1];
  const skillArea = (["listening", "reading", "writing", "speaking"] as string[]).includes(lesson.area) ? (lesson.area as Skill) : null;

  const setStatus = (status: "completed" | "skipped") =>
    update((d) => { d.lessons[lesson.id] = { status, at: new Date().toISOString(), note }; });

  return (
    <div className={SKILL_CLASS[lesson.area] ?? ""}>
      <p className="small"><Link href="/plan">← แผนการเรียน</Link></p>
      <div className="spread">
        <div>
          <span className="badge skill-chip">{AREA_LABEL[lesson.area]}</span>{" "}
          <span className="muted small">สัปดาห์ {lesson.week} · วันที่ {lesson.day} · {formatThaiDate(lessonDate(state, lesson))}</span>
          <h1 className="en" style={{ marginTop: 6 }}>{lesson.title}</h1>
        </div>
        <span className={`badge ${rec?.status === "completed" ? "ok" : st === "overdue" ? "warn" : ""}`}>
          {rec?.status === "completed" ? "เสร็จแล้ว" : rec?.status === "skipped" ? "ข้ามแล้ว" : st === "overdue" ? "ค้าง" : "ยังไม่เสร็จ"}
        </span>
      </div>

      <div className="card skill-card">
        <h2>1. เป้าหมายการเรียน</h2>
        <p style={{ marginBottom: 4 }}>{lesson.objectiveTh}</p>
        <p className="small muted en">{lesson.objective}</p>
        <h2>2. เวลาโดยประมาณ ({lesson.segments.reduce((a, x) => a + x.minutes, 0)} นาที)</h2>
        <ul style={{ margin: "0 0 0 1.2rem", padding: 0 }}>
          {lesson.segments.map((s) => <li key={s.label}>{s.label} — {s.minutes} นาที</li>)}
        </ul>
      </div>

      {lesson.explanationTh.length > 0 && (
        <div className="card">
          <h2>3. คำอธิบาย</h2>
          {lesson.explanationTh.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      {lesson.examples.length > 0 && (
        <div className="card">
          <h2>4. ตัวอย่าง</h2>
          <ul style={{ margin: "0 0 0 1.2rem", padding: 0 }}>
            {lesson.examples.map((e, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <span className="en" style={{ whiteSpace: "pre-wrap" }}>{e.en}</span>
                {e.th && <div className="small muted">{e.th}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.guided.length > 0 && (
        <div className="card">
          <h2>5. ฝึกแบบมีตัวช่วย</h2>
          <p className="small muted">ตอบทุกข้อแล้วกดตรวจ แอปจะอธิบายทุกข้อ ข้อที่ผิดจะถูกเพิ่มลงสมุดข้อผิดพลาด</p>
          <Quiz
            questions={lesson.guided}
            initialAnswers={state.guided[lesson.id]}
            onAnswersChange={(a) => update((d) => { d.guided[lesson.id] = a; })}
            onSubmit={(g) =>
              update((d) => {
                recordAttempt(d, g, { source: lesson.area === "review" ? "review-quiz" : "lesson", refId: lesson.id, title: `Lesson ${lesson.day}: ${lesson.title}`, skill: lesson.area });
                mistakesFromGraded(d, g, lesson.area, `lesson:${lesson.id}`);
              })
            }
          />
        </div>
      )}

      <div className="card">
        <h2>6. ฝึกด้วยตัวเอง</h2>
        <p>{lesson.independent.th}</p>
        {lesson.independent.link && <Link className="btn primary" href={lesson.independent.link.href}>{lesson.independent.link.label}</Link>}
        {lesson.area === "review" && (
          <div className="row" style={{ marginTop: 8 }}>
            <Link className="btn" href="/vocabulary?review=1">ทบทวนคำศัพท์ที่ถึงกำหนด</Link>
          </div>
        )}
      </div>

      <div className="card">
        <h2>7. วิธีตรวจคำตอบ</h2>
        <p>{lesson.checkingTh}</p>
      </div>

      <div className="card">
        <h2>8. ทบทวนข้อผิดพลาดที่พบบ่อย</h2>
        <ul style={{ margin: "0 0 0 1.2rem", padding: 0 }}>
          {lesson.mistakeReviewTh.map((m) => <li key={m} className="en">{m}</li>)}
        </ul>
        <div className="field" style={{ marginTop: "0.75rem" }}>
          <label htmlFor="note">บันทึกของฉัน (ข้อผิดพลาดที่ยังเกิดซ้ำ / สิ่งที่อยากถามติวเตอร์)</label>
          <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => rec && update((d) => { d.lessons[lesson.id].note = note; })} />
        </div>
      </div>

      {lesson.vocab && lesson.vocab.length > 0 && (
        <div className="card"><VocabList items={lesson.vocab} source={`lesson:${lesson.id}`} /></div>
      )}

      <div className="card">
        <h2>9. สถานะบทเรียน</h2>
        {rec ? (
          <div className="row">
            <span>{rec.status === "completed" ? "✓ เสร็จแล้ว" : "ข้ามแล้ว"} เมื่อ {formatThaiDate(rec.at.slice(0, 10))}</span>
            <button className="btn small" onClick={() => update((d) => { delete d.lessons[lesson.id]; })}>ยกเลิกสถานะ</button>
            {next && <button className="btn primary" onClick={() => router.push(`/lesson/${next.id}`)}>บทถัดไป →</button>}
          </div>
        ) : moving ? (
          <div className="row">
            <input type="date" value={newDate} min={state.settings.startDate} onChange={(e) => setNewDate(e.target.value)} aria-label="วันใหม่" style={{ width: 170 }} />
            <button className="btn primary" disabled={!newDate} onClick={() => { update((d) => { d.reschedule[lesson.id] = newDate; }); setMoving(false); }}>บันทึกวันใหม่</button>
            <button className="btn" onClick={() => setMoving(false)}>ยกเลิก</button>
          </div>
        ) : (
          <div className="row">
            <button className="btn primary" onClick={() => setStatus("completed")}>ทำเสร็จแล้ว</button>
            <button className="btn" onClick={() => setStatus("skipped")}>ข้ามบทนี้</button>
            <button className="btn" onClick={() => { setMoving(true); setNewDate(today()); }}>เลื่อนไปวันอื่น</button>
          </div>
        )}
        {skillArea && <p className="small muted" style={{ marginTop: 8 }}>อย่าลืมใช้ตัวจับเวลา เพื่อบันทึกเวลาเรียน {AREA_LABEL[skillArea]}</p>}
      </div>
    </div>
  );
}
