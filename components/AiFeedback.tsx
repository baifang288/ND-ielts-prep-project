"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { addMistake } from "@/lib/actions";
import { parseCorrections } from "@/lib/writing-checks";
import { MISTAKE_LABEL } from "@/lib/labels";
import type { Area, MistakeCategory } from "@/lib/types";
import { OfficialNotice } from "./Bits";

export default function AiFeedback({ text, skill, source, model }: { text: string; skill: Area; source: string; model?: string }) {
  const { update } = useStore();
  const items = parseCorrections(text);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const save = (i: number) => {
    const it = items[i];
    const category = (MISTAKE_LABEL[it.category] ? it.category : "other") as MistakeCategory;
    update((d) => {
      addMistake(d, { original: it.original, corrected: it.corrected, explanationTh: it.explanation, category, skill, source, practice: `Correct this sentence: ${it.original}` });
    });
    setSaved((s) => new Set(s).add(i));
  };

  return (
    <div>
      <OfficialNotice kind="ai" />
      <div className="ai-output">{text}</div>
      {model && <p className="small muted">โมเดล: {model}</p>}
      {items.length > 0 && (
        <div className="notice info" style={{ marginTop: 12 }}>
          <b>บันทึกข้อผิดพลาดลงสมุด</b> (จะกลับมาให้ฝึกแก้ภายหลัง)
          {items.map((it, i) => (
            <div key={i} className="spread" style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
              <span className="small en">❌ {it.original}<br />✅ {it.corrected}</span>
              <button className="btn small" disabled={saved.has(i)} onClick={() => save(i)}>{saved.has(i) ? "บันทึกแล้ว ✓" : "บันทึก"}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
