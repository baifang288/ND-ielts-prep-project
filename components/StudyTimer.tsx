"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { logStudy } from "@/lib/actions";
import { minutesToday, AREA_LABEL } from "@/lib/stats";
import type { Area, TimerState } from "@/lib/types";

const MAX_SEC = 4 * 3600; // ignore runaway timers left open overnight

export function elapsedSec(t: TimerState, now = Date.now()): number {
  const live = t.running && t.startedAt ? (now - t.startedAt) / 1000 : 0;
  return Math.min(MAX_SEC, Math.floor(t.accumulatedSec + live));
}

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (h ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AREAS: Area[] = ["listening", "reading", "writing", "speaking", "grammar", "vocab", "review"];

export default function StudyTimer({ compact = false, defaultArea, label }: { compact?: boolean; defaultArea?: Area; label?: string }) {
  const { state, update } = useStore();
  const t = state.timer;
  const [now, setNow] = useState(Date.now());
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!t.running) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [t.running]);

  const sec = elapsedSec(t, now);
  const goal = state.settings.dailyMinutes;
  const doneToday = minutesToday(state);
  const pendingMin = Math.floor(sec / 60);
  const pct = Math.min(100, Math.round(((doneToday + pendingMin) / goal) * 100));

  const start = () =>
    update((d) => {
      d.timer.running = true;
      d.timer.startedAt = Date.now();
      if (!d.timer.accumulatedSec) {
        d.timer.area = defaultArea ?? d.timer.area;
        d.timer.label = label ?? d.timer.label;
      }
    });
  const pause = () =>
    update((d) => {
      d.timer.accumulatedSec = elapsedSec(d.timer);
      d.timer.running = false;
      d.timer.startedAt = undefined;
    });
  const stop = () => {
    const total = elapsedSec(t);
    const minutes = Math.round(total / 60);
    update((d) => {
      if (minutes > 0) logStudy(d, minutes, d.timer.area);
      d.timer = { running: false, accumulatedSec: 0, area: d.timer.area, label: "" };
    });
    setSaved(minutes > 0 ? `บันทึก ${minutes} นาที (${AREA_LABEL[t.area]})` : "เวลาไม่ถึง 30 วินาที จึงไม่บันทึก");
    setTimeout(() => setSaved(null), 4000);
  };

  return (
    <div className={compact ? "card small" : "card"} style={compact ? { padding: "0.75rem" } : undefined} aria-label="ตัวจับเวลาเรียน">
      <div className="spread">
        <strong>{compact ? "จับเวลาเรียน" : `ตัวจับเวลาเรียนวันนี้ (เป้าหมาย ${goal} นาที)`}</strong>
        {!compact && <span className="badge info">{doneToday + pendingMin}/{goal} นาที</span>}
      </div>
      <div className="timer" style={compact ? { fontSize: "1.4rem" } : undefined} aria-live="off">{fmt(sec)}</div>
      <div className="progress" aria-label={`ความคืบหน้าเวลาวันนี้ ${pct}%`}><span style={{ width: `${pct}%` }} /></div>
      {!compact && (
        <div className="field" style={{ marginTop: "0.75rem" }}>
          <label htmlFor="timer-area">กำลังเรียน</label>
          <select id="timer-area" value={t.area} onChange={(e) => update((d) => { d.timer.area = e.target.value as Area; })}>
            {AREAS.map((a) => <option key={a} value={a}>{AREA_LABEL[a]}</option>)}
          </select>
        </div>
      )}
      <div className="row" style={{ marginTop: "0.5rem" }}>
        {t.running ? (
          <button className="btn small" onClick={pause}>หยุดชั่วคราว</button>
        ) : (
          <button className="btn small primary" onClick={start}>{sec > 0 ? "เรียนต่อ" : "เริ่ม"}</button>
        )}
        <button className="btn small" onClick={stop} disabled={sec === 0}>จบและบันทึก</button>
      </div>
      {compact && <div className="muted small" style={{ marginTop: "0.3rem" }}>วันนี้ {doneToday + pendingMin}/{goal} นาที · {AREA_LABEL[t.area]}</div>}
      {doneToday + pendingMin >= goal && <div className="muted small" role="status">ครบ {goal} นาทีแล้ววันนี้ 🎉 พักได้</div>}
      {saved && <div className="small" role="status">{saved}</div>}
    </div>
  );
}
