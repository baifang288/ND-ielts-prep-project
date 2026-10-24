"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { READING, allQuestions } from "@/data/reading";
import Quiz from "@/components/Quiz";
import { Empty, OfficialNotice, VocabList } from "@/components/Bits";
import { mistakesFromGraded, recordAttempt, setLastLocation } from "@/lib/actions";

function mmss(s: number) {
  const a = Math.abs(s);
  return `${s < 0 ? "-" : ""}${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")}`;
}

export default function ReadingExercisePage() {
  const { id } = useParams<{ id: string }>();
  const p = READING.find((x) => x.id === id);
  const { state, update } = useStore();
  const [timed, setTimed] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [done, setDone] = useState(false);
  const opened = useRef(Date.now());

  useEffect(() => {
    if (p) update((d) => setLastLocation(d, `/reading/${p.id}`, `Reading ${p.id}: ${p.title}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!startedAt || done) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [startedAt, done]);

  if (!p) return <Empty action={<Link className="btn" href="/reading">กลับ</Link>}>ไม่พบบทอ่านนี้</Empty>;

  const left = startedAt ? p.minutes * 60 - Math.floor((now - startedAt) / 1000) : p.minutes * 60;
  const questions = allQuestions(p);

  return (
    <div className="skill-reading">
      <p className="small"><Link href="/reading">← Reading</Link></p>
      <div className="spread">
        <h1 className="en">{p.id}. {p.title}</h1>
        <span className="badge skill-chip">{p.level}</span>
      </div>
      <p>{p.focusTh}</p>
      <OfficialNotice kind="original" />

      <div className="card row">
        <label className="checkline" style={{ margin: 0 }}>
          <input type="checkbox" checked={timed} disabled={!!startedAt} onChange={(e) => setTimed(e.target.checked)} />
          <span>โหมดจับเวลา ({p.minutes} นาที)</span>
        </label>
        {timed && !startedAt && <button className="btn small primary" onClick={() => { setStartedAt(Date.now()); setNow(Date.now()); }}>เริ่มจับเวลา</button>}
        {startedAt && (
          <span className={`badge ${left < 0 ? "bad" : left < 120 ? "warn" : "info"}`} role="timer" aria-live="off" style={{ fontSize: "1rem" }}>
            {left < 0 ? `หมดเวลา (เกิน ${mmss(-left)})` : `เหลือ ${mmss(left)}`}
          </span>
        )}
      </div>
      {startedAt && left < 0 && !done && <div className="notice warn" role="alert">หมดเวลาแล้ว — ส่งคำตอบตอนนี้ ในข้อสอบจริงจะไม่มีเวลาเพิ่ม</div>}

      {timed && !startedAt ? (
        <div className="card"><p>กด &quot;เริ่มจับเวลา&quot; เพื่อแสดงบทอ่านและคำถาม</p></div>
      ) : (
        <div className="split">
          <div className="card passage sticky">
            {p.paragraphs.map((para) => (
              <p key={para.label} className="en"><span className="plabel">{para.label}</span>{para.text}</p>
            ))}
          </div>
          <div className="card">
            <Quiz
              questions={questions}
              groups={p.questionGroups}
              onSubmit={(g) => {
                setDone(true);
                const timeSec = Math.round((Date.now() - (startedAt ?? opened.current)) / 1000);
                update((d) => {
                  recordAttempt(d, g, { source: "reading", refId: p.id, title: `${p.id} ${p.title}`, skill: "reading", timed: !!startedAt, timeSec });
                  mistakesFromGraded(d, g, "reading", `reading:${p.id}`);
                });
              }}
            />
          </div>
        </div>
      )}
      <div className="card"><VocabList items={p.vocab} source={`reading:${p.id}`} /></div>
    </div>
  );
}
