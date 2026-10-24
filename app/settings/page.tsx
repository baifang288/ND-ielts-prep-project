"use client";

import { useRef, useState } from "react";
import { STORAGE_KEY, defaultState, migrate, useStore } from "@/lib/store";
import { useAiStatus } from "@/lib/ai-client";
import { daysBetween, formatThaiDate, isValidISODate, today } from "@/lib/dates";

export default function SettingsPage() {
  const { state, update, replace } = useStore();
  const ai = useAiStatus();
  const [start, setStart] = useState(state.settings.startDate);
  const [exam, setExam] = useState(state.settings.examDate);
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [code, setCode] = useState(state.settings.accessCode);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveDates = () => {
    if (!isValidISODate(start) || !isValidISODate(exam)) return setMsg({ kind: "bad", text: "รูปแบบวันที่ไม่ถูกต้อง" });
    if (exam <= start) return setMsg({ kind: "bad", text: "วันสอบต้องอยู่หลังวันเริ่มเรียน" });
    const months = daysBetween(start, exam) / 30.4;
    update((d) => { d.settings.startDate = start; d.settings.examDate = exam; });
    setMsg({
      kind: "ok",
      text: `บันทึกแล้ว · ห่างกันประมาณ ${months.toFixed(1)} เดือน${months < 9 ? " — สั้นกว่าแผน 9 เดือน ควรพิจารณาเลื่อนวันสอบ" : ""}`,
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ielts-prep-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const next = migrate(JSON.parse(await file.text()));
      replace(next);
      setStart(next.settings.startDate);
      setExam(next.settings.examDate);
      setMsg({ kind: "ok", text: "นำเข้าข้อมูลสำเร็จ" });
    } catch (e) {
      setMsg({ kind: "bad", text: "นำเข้าไม่สำเร็จ: " + (e instanceof Error ? e.message : String(e)) });
    }
  };

  return (
    <div>
      <h1>ตั้งค่า</h1>
      {msg && <div className={`notice ${msg.kind}`} role="status">{msg.text}</div>}

      <div className="card">
        <h2>วันเรียนและวันสอบ</h2>
        <div className="grid grid-2">
          <div className="field"><label htmlFor="s-start">วันเริ่มเรียน</label><input id="s-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="field"><label htmlFor="s-exam">วันสอบเป้าหมาย (ชั่วคราว)</label><input id="s-exam" type="date" value={exam} onChange={(e) => setExam(e.target.value)} /></div>
        </div>
        <p className="small muted">ค่าเริ่มต้น: เริ่ม 9 พ.ย. 2026 · สอบ ส.ค. 2027 (ยังไม่ได้จองสอบ) ตอนนี้: {formatThaiDate(state.settings.startDate, false)} → {formatThaiDate(state.settings.examDate, false)}</p>
        <button className="btn primary" onClick={saveDates}>บันทึกวันที่</button>
      </div>

      <div className="card">
        <h2>การเรียน</h2>
        <div className="grid grid-3">
          <div className="field">
            <label htmlFor="s-min">เวลาเรียนต่อวัน (นาที)</label>
            <input id="s-min" type="number" min={15} max={240} step={5} value={state.settings.dailyMinutes}
              onChange={(e) => { const n = Number(e.target.value); if (n >= 15 && n <= 240) update((d) => { d.settings.dailyMinutes = n; }); }} />
          </div>
          <div className="field">
            <label htmlFor="s-months">ระยะเวลาแผน</label>
            <select id="s-months" value={state.settings.planMonths} onChange={(e) => update((d) => { d.settings.planMonths = Number(e.target.value); })}>
              {[9, 10, 11, 12].map((m) => <option key={m} value={m}>{m} เดือน</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-theme">ธีม</label>
            <select id="s-theme" value={state.settings.theme} onChange={(e) => update((d) => { d.settings.theme = e.target.value as "system" | "light" | "dark"; })}>
              <option value="system">ตามระบบ</option><option value="light">สว่าง</option><option value="dark">มืด</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-rate">ความเร็วเสียง Listening เริ่มต้น</label>
            <select id="s-rate" value={state.settings.ttsRate} onChange={(e) => update((d) => { d.settings.ttsRate = Number(e.target.value); })}>
              <option value={0.75}>0.75×</option><option value={0.9}>0.9×</option><option value={1}>1.0×</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" id="ai">
        <h2>AI feedback</h2>
        <p>
          สถานะ: {!ai.checked ? "กำลังตรวจ…" : ai.configured ? <span className="badge ok">พร้อมใช้งาน{ai.model ? ` · ${ai.model}` : ""}</span> : <span className="badge warn">ยังไม่ได้ตั้งค่า</span>}
          {ai.error && <span className="small muted"> ({ai.error})</span>}
        </p>
        {!ai.configured && process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" && (
          <p className="small">เว็บเวอร์ชันนี้เป็นเว็บแบบ static (เช่น GitHub Pages) ซึ่งไม่มีเซิร์ฟเวอร์สำหรับเก็บ API key จึงใช้ AI ในแอปไม่ได้ ทุกฟีเจอร์อื่นใช้ได้ตามปกติ และใช้ปุ่มคัดลอกคำสั่งไปถาม AI ภายนอกได้ ถ้าต้องการ AI ในแอป ให้ deploy บน Vercel ตาม README</p>
        )}
        {!ai.configured && process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1" && (
          <div className="small">
            <p>AI ทำงานบนเซิร์ฟเวอร์เท่านั้น (API key ไม่ถูกส่งมาที่เบราว์เซอร์) วิธีเปิดใช้:</p>
            <ol style={{ margin: "0 0 0.5rem 1.2rem", padding: 0 }}>
              <li>สร้าง API key ที่ console.anthropic.com (มีค่าใช้จ่ายตามการใช้งาน)</li>
              <li>ตั้งค่าตัวแปร <code>ANTHROPIC_API_KEY</code> บนเซิร์ฟเวอร์ (ไฟล์ <code>.env.local</code> หรือหน้า Environment Variables ของผู้ให้บริการ hosting)</li>
              <li>ถ้าเปิดเว็บสู่สาธารณะ ตั้ง <code>APP_ACCESS_CODE</code> ด้วย เพื่อไม่ให้คนอื่นใช้ AI ด้วยเงินของคุณ</li>
              <li>รีสตาร์ต/redeploy แล้วรีเฟรชหน้านี้</li>
            </ol>
            <p className="muted">ระหว่างนี้ทุกฟีเจอร์ยังใช้ได้ในโหมดไม่ใช้ AI: ตรวจคำตอบอัตโนมัติ, ตรวจงานเขียนเบื้องต้น, checklist ตามเกณฑ์, และปุ่มคัดลอกคำสั่งไปใช้กับ AI ภายนอก</p>
          </div>
        )}
        {ai.needsCode && (
          <div className="field">
            <label htmlFor="s-code">รหัสเข้าใช้ AI (APP_ACCESS_CODE)</label>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input id="s-code" type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
              <button className="btn" onClick={() => { update((d) => { d.settings.accessCode = code; }); setMsg({ kind: "ok", text: "บันทึกรหัสแล้ว" }); }}>บันทึก</button>
            </div>
            <p className="small muted">เก็บไว้ในเบราว์เซอร์นี้เท่านั้น</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>ข้อมูลของฉัน</h2>
        <p className="small">
          ข้อมูลการเรียนทั้งหมดเก็บในเบราว์เซอร์นี้ (localStorage key <code>{STORAGE_KEY}</code>) ไม่มีการส่งขึ้นเซิร์ฟเวอร์ ยกเว้นข้อความที่คุณกดส่งให้ AI
          ถ้าล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง ข้อมูลจะหาย — <b>สำรองข้อมูลเป็นไฟล์สม่ำเสมอ</b> และนำเข้าบนอุปกรณ์อื่นได้
        </p>
        <div className="row">
          <button className="btn primary" onClick={exportData}>ส่งออกข้อมูล (.json)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>นำเข้าข้อมูล</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ""; }} />
        </div>
        <hr />
        {!confirmReset ? (
          <button className="btn danger" onClick={() => setConfirmReset(true)}>ล้างข้อมูลทั้งหมด…</button>
        ) : (
          <div className="notice bad">
            <p>ลบความก้าวหน้า คำศัพท์ ข้อผิดพลาด และงานเขียนทั้งหมด? ย้อนกลับไม่ได้ (แนะนำให้ส่งออกข้อมูลก่อน)</p>
            <div className="row">
              <button className="btn danger" onClick={() => { const d = defaultState(); replace(d); setStart(d.settings.startDate); setExam(d.settings.examDate); setConfirmReset(false); setMsg({ kind: "ok", text: "ล้างข้อมูลแล้ว" }); }}>ยืนยัน ลบทั้งหมด</button>
              <button className="btn" onClick={() => setConfirmReset(false)}>ยกเลิก</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
