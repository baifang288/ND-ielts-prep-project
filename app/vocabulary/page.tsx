"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addVocab, hasVocab, rateVocab } from "@/lib/actions";
import { vocabStats } from "@/lib/stats";
import { SRS_INTERVALS } from "@/lib/srs";
import { formatThaiDate, today } from "@/lib/dates";
import { speak } from "@/components/TTSPlayer";
import { Empty } from "@/components/Bits";

const EMPTY_FORM = { en: "", th: "", example: "", ipa: "", topic: "General", level: "B1" as const };

function Review({ onExit }: { onExit: () => void }) {
  const { state, update } = useStore();
  const due = useMemo(() => state.vocab.filter((v) => v.dueDate <= today()).map((v) => v.id), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const item = state.vocab.find((v) => v.id === due[i]);

  if (!due.length) return <Empty action={<button className="btn" onClick={onExit}>กลับไปสมุดคำศัพท์</button>}>ไม่มีคำที่ถึงกำหนดทบทวนวันนี้ 🎉</Empty>;
  if (!item) return <Empty action={<button className="btn primary" onClick={onExit}>เสร็จแล้ว</button>}>ทบทวนครบ {due.length} คำแล้ววันนี้</Empty>;

  const rate = (r: "easy" | "difficult" | "forgotten") => {
    update((d) => rateVocab(d, item.id, r));
    setShow(false);
    setI(i + 1);
  };

  return (
    <div className="card center" style={{ maxWidth: 560, margin: "0 auto" }}>
      <p className="small muted">คำที่ {i + 1}/{due.length}</p>
      <p className="en" style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0.5rem 0" }}>{item.en}</p>
      {item.ipa && <p className="muted en">{item.ipa}</p>}
      <button className="btn small" onClick={() => speak(item.en, state.settings.ttsRate)}>🔊 ฟังเสียง</button>
      {!show ? (
        <div style={{ marginTop: "1rem" }}>
          <p className="small muted">นึกความหมายและแต่งประโยคในใจก่อน แล้วค่อยเปิดดู</p>
          <button className="btn primary" onClick={() => setShow(true)}>ดูความหมาย</button>
        </div>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "1.2rem" }}>{item.th}</p>
          <p className="en muted">{item.example}</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn" onClick={() => rate("forgotten")}>ลืม (ทบทวนพรุ่งนี้)</button>
            <button className="btn" onClick={() => rate("difficult")}>ยาก</button>
            <button className="btn primary" onClick={() => rate("easy")}>ง่าย</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VocabInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(state.vocab.length === 0);
  const reviewing = params.get("review") === "1";
  const st = vocabStats(state);
  const topics = [...new Set(state.vocab.map((v) => v.topic))].sort();
  const t = today();

  const list = state.vocab.filter((v) => {
    if (q && !`${v.en} ${v.th}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (topic && v.topic !== topic) return false;
    if (status === "due" && v.dueDate > t) return false;
    if (status === "new" && v.reviews.length) return false;
    if (status === "learned" && v.stage < 3) return false;
    return true;
  });

  if (reviewing) {
    return (
      <div>
        <h1>ทบทวนคำศัพท์</h1>
        <p className="small muted">ระบบทบทวนแบบเว้นระยะ: ตอบ &quot;ง่าย&quot; จะเว้นนานขึ้น ({SRS_INTERVALS.join(" → ")} วัน) · &quot;ยาก&quot; ทบทวนเร็วขึ้น · &quot;ลืม&quot; เริ่มใหม่พรุ่งนี้</p>
        <Review onExit={() => router.push("/vocabulary")} />
      </div>
    );
  }

  const submit = () => {
    if (!form.en.trim() || !form.th.trim()) return setMsg("กรอกคำศัพท์และความหมายภาษาไทย");
    if (hasVocab(state, form.en)) return setMsg(`"${form.en}" มีอยู่ในสมุดแล้ว`);
    update((d) => { addVocab(d, { ...form, ipa: form.ipa || undefined, source: "manual" }); });
    setMsg(`เพิ่ม "${form.en}" แล้ว — ทบทวนครั้งแรกพรุ่งนี้`);
    setForm({ ...EMPTY_FORM, topic: form.topic });
  };

  return (
    <div>
      <div className="spread">
        <h1>สมุดคำศัพท์</h1>
        <button className="btn primary" onClick={() => router.push("/vocabulary?review=1")} disabled={!st.due}>ทบทวนวันนี้ ({st.due})</button>
      </div>
      <div className="grid grid-4">
        <div className="card center"><div className="muted small">ทั้งหมด</div><div className="big">{st.total}</div></div>
        <div className="card center"><div className="muted small">ถึงกำหนดวันนี้</div><div className="big">{st.due}</div></div>
        <div className="card center"><div className="muted small">จำได้แล้ว (≥ 7 วัน)</div><div className="big">{st.learned}</div></div>
        <div className="card center"><div className="muted small">อัตราจำได้ตอนทบทวน</div><div className="big">{st.retention === null ? "—" : `${st.retention}%`}</div></div>
      </div>

      <details className="card" open={formOpen} onToggle={(e) => setFormOpen((e.target as HTMLDetailsElement).open)}>
        <summary>+ เพิ่มคำศัพท์เอง</summary>
        <div className="grid grid-2" style={{ marginTop: 8 }}>
          <div className="field"><label htmlFor="v-en">คำ/วลีภาษาอังกฤษ *</label><input id="v-en" type="text" className="en" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} /></div>
          <div className="field"><label htmlFor="v-th">ความหมายภาษาไทย *</label><input id="v-th" type="text" value={form.th} onChange={(e) => setForm({ ...form, th: e.target.value })} /></div>
          <div className="field"><label htmlFor="v-ex">ประโยคตัวอย่าง</label><input id="v-ex" type="text" className="en" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} /></div>
          <div className="field"><label htmlFor="v-ipa">การออกเสียง (IPA ถ้ามี)</label><input id="v-ipa" type="text" value={form.ipa} onChange={(e) => setForm({ ...form, ipa: e.target.value })} placeholder="/ˈkʌl.tʃər/" /></div>
          <div className="field"><label htmlFor="v-topic">หมวด</label><input id="v-topic" type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} list="topics" /><datalist id="topics">{topics.map((x) => <option key={x} value={x} />)}</datalist></div>
          <div className="field">
            <label htmlFor="v-level">ระดับ</label>
            <select id="v-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as typeof form.level })}>
              {["A2", "B1", "B2", "C1"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button className="btn primary" onClick={submit}>เพิ่มลงสมุด</button>
        {msg && <span className="small" role="status" style={{ marginLeft: 8 }}>{msg}</span>}
      </details>

      <div className="card">
        <div className="grid grid-3">
          <input type="search" placeholder="ค้นหา" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหาคำศัพท์" />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="กรองตามหมวด"><option value="">ทุกหมวด</option>{topics.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="กรองตามสถานะ">
            <option value="">ทุกสถานะ</option><option value="due">ถึงกำหนด</option><option value="new">ยังไม่เคยทบทวน</option><option value="learned">จำได้แล้ว</option>
          </select>
        </div>
      </div>

      {!state.vocab.length ? (
        <Empty>ยังไม่มีคำศัพท์ เพิ่มเองด้านบน หรือกด &quot;+ สมุดคำศัพท์&quot; ในบทเรียนและแบบฝึก</Empty>
      ) : !list.length ? (
        <Empty>ไม่พบคำที่ตรงกับตัวกรอง</Empty>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>คำ</th><th>ความหมาย / ตัวอย่าง</th><th>หมวด</th><th>สถานะ</th><th></th></tr></thead>
            <tbody>
              {list.map((v) => (
                <tr key={v.id}>
                  <td className="en">
                    <b>{v.en}</b> <button className="btn small ghost" aria-label={`ฟังเสียง ${v.en}`} onClick={() => speak(v.en, state.settings.ttsRate)}>🔊</button>
                    {v.ipa && <div className="small muted">{v.ipa}</div>}
                  </td>
                  <td>
                    {editing === v.id ? (
                      <div>
                        <input type="text" value={v.th} onChange={(e) => update((d) => { d.vocab.find((x) => x.id === v.id)!.th = e.target.value; })} aria-label="ความหมาย" />
                        <input type="text" className="en" value={v.example} onChange={(e) => update((d) => { d.vocab.find((x) => x.id === v.id)!.example = e.target.value; })} aria-label="ตัวอย่าง" style={{ marginTop: 4 }} />
                      </div>
                    ) : (
                      <>{v.th}<div className="small en muted">{v.example}</div></>
                    )}
                  </td>
                  <td className="small">{v.topic}<div className="muted">{v.level} · เพิ่ม {formatThaiDate(v.addedAt, false)}</div></td>
                  <td className="small">
                    {v.dueDate <= t ? <span className="badge warn">ถึงกำหนด</span> : <span className="badge">{formatThaiDate(v.dueDate, false)}</span>}
                    <div className="muted">ทบทวน {v.reviews.length} ครั้ง{v.stage >= 3 && " · จำได้แล้ว"}</div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn small ghost" onClick={() => setEditing(editing === v.id ? null : v.id)}>{editing === v.id ? "เสร็จ" : "แก้ไข"}</button>
                    <button className="btn small ghost" onClick={() => update((d) => { d.vocab = d.vocab.filter((x) => x.id !== v.id); })} aria-label={`ลบ ${v.en}`}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={<p className="muted">กำลังโหลด…</p>}>
      <VocabInner />
    </Suspense>
  );
}
