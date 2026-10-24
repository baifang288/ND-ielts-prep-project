"use client";

import { useState } from "react";
import { RESOURCES, type Resource } from "@/data/resources";
import { PHASES } from "@/data/roadmap";

const SKILL_LABEL: Record<Resource["skills"][number], string> = {
  listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking", grammar: "Grammar", vocab: "Vocabulary", "exam-info": "ข้อมูลข้อสอบ",
};

export default function ResourcesPage() {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [phase, setPhase] = useState("");
  const list = RESOURCES.filter(
    (r) => (!skill || r.skills.includes(skill as Resource["skills"][number])) && (!level || r.levels.includes(level)) && (!phase || r.phases.includes(Number(phase))),
  );

  return (
    <div>
      <h1>แหล่งเรียนรู้ฟรี</h1>
      <p className="small muted">
        ลิงก์ทั้งหมดเปิดในแท็บใหม่ไปยังเว็บไซต์ภายนอก ป้าย <span className="badge ok">ทางการ</span> ใช้เฉพาะสื่อที่เผยแพร่โดย IELTS (ielts.org) เท่านั้น
        สื่อจาก British Council และ BBC เป็นสื่อเรียนภาษาอังกฤษที่ดี แต่ไม่ใช่ข้อสอบ IELTS ทางการ
      </p>
      <div className="card grid grid-3">
        <div><label htmlFor="f-skill">ทักษะ</label>
          <select id="f-skill" value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="">ทั้งหมด</option>{Object.entries(SKILL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div><label htmlFor="f-level">ระดับ CEFR</label>
          <select id="f-level" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">ทั้งหมด</option>{["A2", "B1", "B2", "C1"].map((l) => <option key={l}>{l}</option>)}
          </select></div>
        <div><label htmlFor="f-phase">ช่วงของแผน</label>
          <select id="f-phase" value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="">ทั้งหมด</option>{PHASES.map((p) => <option key={p.n} value={p.n}>Phase {p.n}: {p.titleTh}</option>)}
          </select></div>
      </div>
      {list.length === 0 && <p className="muted">ไม่พบแหล่งเรียนรู้ที่ตรงกับตัวกรอง</p>}
      <div className="grid grid-2">
        {list.map((r) => (
          <div key={r.url} className="card">
            <div className="spread">
              <a href={r.url} target="_blank" rel="noopener noreferrer"><b>{r.title}</b> ↗</a>
              <span className={`badge ${r.official ? "ok" : ""}`}>{r.official ? "ทางการ" : "ภายนอก"}</span>
            </div>
            <p className="small muted" style={{ margin: "2px 0 6px" }}>{r.provider}</p>
            <p className="small">{r.descriptionTh}</p>
            <div className="pill-list">
              {r.skills.map((s) => <span key={s} className="badge">{SKILL_LABEL[s]}</span>)}
              <span className="badge info">{r.levels.join("–")}</span>
              <span className="badge">Phase {r.phases.join(", ")}</span>
            </div>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{r.verified}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
