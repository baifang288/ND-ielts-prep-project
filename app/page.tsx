"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  AREA_LABEL, SKILLS, daysUntil, lessonDate, openMistakeCategories, recommendNext, skillSummary, streak,
  todaysLesson, totalMinutes, vocabStats, weekCompletion,
} from "@/lib/stats";
import { formatMinutes, formatThaiDate } from "@/lib/dates";
import { PHASES } from "@/data/roadmap";
import StudyTimer from "@/components/StudyTimer";
import { Bar, Empty } from "@/components/Bits";
import { MISTAKE_LABEL } from "@/lib/labels";

export default function Dashboard() {
  const { state } = useStore();
  const s = state;
  const { lesson, early } = todaysLesson(s);
  const toStart = daysUntil(s.settings.startDate);
  const toExam = daysUntil(s.settings.examDate);
  const week = weekCompletion(s);
  const v = vocabStats(s);
  const mistakes = openMistakeCategories(s).slice(0, 4);
  const recent = s.attempts.filter((a) => a.source !== "mistake-quiz").reverse().slice(0, 5);
  const rec = recommendNext(s);
  const phase = PHASES[s.phase.current - 1];

  return (
    <div>
      <div className="spread" style={{ marginBottom: "1rem" }}>
        <div>
          <h1>แดชบอร์ด</h1>
          <p className="muted" style={{ margin: 0 }}>
            เป้าหมาย: <b>IELTS Academic Overall 6.5</b> · ไม่มีทักษะใดต่ำกว่า <b>6.0</b>
          </p>
        </div>
        <span className="badge info">Phase {phase.n}: {phase.titleTh}</span>
      </div>

      {!s.assessment && (
        <div className="notice warn">
          <b>ยังไม่ได้ทำแบบประเมินเริ่มต้น</b> — ยังไม่มีผลการเรียนใด ๆ ในแอป เริ่มจากแบบประเมิน (ประมาณ 60 นาที) เพื่อหาจุดเริ่มต้นของคุณ
          <div style={{ marginTop: 8 }}><Link className="btn small primary" href="/assessment">ทำแบบประเมินเริ่มต้น</Link></div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h2>บทเรียนวันนี้</h2>
          {lesson ? (
            <>
              <p style={{ marginBottom: 4 }}>
                <span className="badge">{AREA_LABEL[lesson.area]}</span>{" "}
                <span className="muted small">วันที่ {lesson.day} · {formatThaiDate(lessonDate(s, lesson))}</span>
              </p>
              <h3 className="en">{lesson.title}</h3>
              <p className="small">{lesson.objectiveTh}</p>
              {early && toStart > 0 && <p className="small muted">ยังไม่ถึงวันเริ่มเรียน — เริ่มก่อนได้ถ้าต้องการ</p>}
              <div className="row">
                <Link className="btn primary hero" href={`/lesson/${lesson.id}`}>เริ่มบทเรียนวันนี้</Link>
                {s.lastLocation && (
                  <Link className="btn" href={s.lastLocation.href}>ทำต่อจากที่ค้างไว้: {s.lastLocation.label}</Link>
                )}
              </div>
            </>
          ) : (
            <Empty action={<Link className="btn" href="/plan">ดูแผนการเรียน</Link>}>
              ทำบทเรียนละเอียด 4 สัปดาห์แรกครบแล้ว ดูโครงร่างสัปดาห์ที่ 5–8 และเกณฑ์ Phase ในหน้าแผนการเรียน
            </Empty>
          )}
        </div>

        <StudyTimer defaultArea={lesson && lesson.area} label={lesson?.title} />
      </div>

      <div className="grid grid-4">
        <div className="card center">
          <div className="muted small">{toStart > 0 ? "เริ่มเรียนในอีก" : "เรียนมาแล้ว"}</div>
          <div className="big">{toStart > 0 ? toStart : -toStart + 1} วัน</div>
          <div className="muted small">เริ่ม {formatThaiDate(s.settings.startDate, false)}</div>
        </div>
        <div className="card center">
          <div className="muted small">ถึงวันสอบเป้าหมาย</div>
          <div className="big">{toExam >= 0 ? `${toExam} วัน` : "เลยกำหนด"}</div>
          <div className="muted small">{formatThaiDate(s.settings.examDate, false)} (ชั่วคราว · <Link href="/settings">เปลี่ยน</Link>)</div>
        </div>
        <div className="card center">
          <div className="muted small">ความสม่ำเสมอ</div>
          <div className="big">{streak(s)} วัน</div>
          <div className="muted small">รวม {formatMinutes(totalMinutes(s))}</div>
        </div>
        <div className="card center">
          <div className="muted small">บทเรียนสัปดาห์นี้</div>
          <div className="big">{week.total ? `${week.pct}%` : "—"}</div>
          <div className="muted small">{week.total ? `${week.done}/${week.total} บทเรียน` : "ไม่มีบทเรียนกำหนดสัปดาห์นี้"}</div>
        </div>
      </div>

      <h2>ทักษะทั้ง 4</h2>
      <div className="grid grid-4">
        {SKILLS.map((k) => {
          const sum = skillSummary(s, k);
          return (
            <Link key={k} href={`/${k}`} className={`card skill-card skill-${k}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="skill-head">{AREA_LABEL[k]}</div>
              <div className="small">บทเรียน {sum.lessonsDone}/{sum.lessonsTotal}</div>
              <Bar pct={sum.lessonsTotal ? (sum.lessonsDone / sum.lessonsTotal) * 100 : 0} label={`${AREA_LABEL[k]} บทเรียน`} />
              <div className="small" style={{ marginTop: 6 }}>
                {sum.accuracy !== null
                  ? <>ความแม่นยำล่าสุด <b>{sum.accuracy}%</b></>
                  : k === "writing" ? <>ฉบับร่างที่บันทึก {sum.activityCount}</>
                  : k === "speaking" ? <>ฝึกพูด {sum.activityCount} ครั้ง</>
                  : <span className="muted">ยังไม่มีผลฝึก</span>}
              </div>
              <div className="muted small">เวลา {formatMinutes(sum.minutes)}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>แนะนำกิจกรรมถัดไป</h3>
          <p style={{ marginBottom: 4 }}><b>{rec.th}</b></p>
          <p className="small muted">{rec.reasonTh}</p>
          <Link className="btn small" href={rec.href}>ไปเลย</Link>
        </div>
        <div className="card">
          <h3>คำศัพท์</h3>
          {v.total ? (
            <>
              <p className="small" style={{ marginBottom: 4 }}>ในสมุด <b>{v.total}</b> · จำได้แล้ว <b>{v.learned}</b> · ทบทวนแล้ว <b>{v.reviewed}</b></p>
              <p className="small">ถึงกำหนดทบทวนวันนี้: <b>{v.due}</b> คำ</p>
              <Link className="btn small" href="/vocabulary?review=1">ทบทวนคำศัพท์</Link>
            </>
          ) : (
            <p className="small muted">ยังไม่มีคำศัพท์ — เพิ่มได้จากบทเรียนและแบบฝึก หรือเพิ่มเองในสมุดคำศัพท์</p>
          )}
        </div>
        <div className="card">
          <h3>ข้อผิดพลาดที่ต้องแก้</h3>
          {mistakes.length ? (
            <>
              <ul style={{ margin: "0 0 0.5rem 1rem", padding: 0 }} className="small">
                {mistakes.map((m) => <li key={m.category}>{MISTAKE_LABEL[m.category] ?? m.category}: {m.count}</li>)}
              </ul>
              <Link className="btn small" href="/mistakes?practice=1">ฝึกจากข้อผิดพลาด</Link>
            </>
          ) : (
            <p className="small muted">ยังไม่มีข้อผิดพลาดที่บันทึกไว้ คำตอบที่ผิดในแบบฝึกจะถูกเพิ่มที่นี่อัตโนมัติ</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="spread"><h3>ผลการฝึกล่าสุด</h3><Link href="/progress" className="small">ดูความก้าวหน้าทั้งหมด</Link></div>
        {recent.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>วันที่</th><th>แบบฝึก</th><th>ทักษะ</th><th>ผล</th></tr></thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td className="small">{formatThaiDate(a.date.slice(0, 10), false)}</td>
                    <td className="en small">{a.title}{a.timed && <span className="badge" style={{ marginLeft: 4 }}>จับเวลา</span>}</td>
                    <td className="small">{AREA_LABEL[a.skill]}</td>
                    <td><b>{a.correct}/{a.total}</b> <span className="muted small">({Math.round((a.correct / a.total) * 100)}%)</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small">ยังไม่มีผลการฝึก ผลจะแสดงที่นี่หลังทำแบบฝึกครั้งแรก (แอปไม่แสดงคะแนนที่ไม่ได้บันทึกจริง)</p>
        )}
      </div>
    </div>
  );
}
