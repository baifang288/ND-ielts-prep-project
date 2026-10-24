import { countWords } from "./check";

export interface RuleFinding {
  level: "info" | "warn";
  th: string;
  quote?: string;
}

const STOP = new Set(
  "the a an and or but of to in on at for with is are was were be been it this that these those i you he she we they my your his her our their as by from not do does did have has had can will would should could so very more most also there which who what when where than then".split(" "),
);

const PATTERNS: { re: RegExp; th: string }[] = [
  { re: /\bpeople is\b/gi, th: "people เป็นพหูพจน์ → people are" },
  { re: /\bmore (better|worse|easier|cheaper|bigger|faster|higher|lower|larger|smaller)\b/gi, th: "ไม่ใช้ more ซ้อนกับรูป -er (เช่น more better → better)" },
  { re: /\b(informations|advices|equipments|furnitures|knowledges|researches|homeworks)\b/gi, th: "คำนามนับไม่ได้ ไม่เติม -s" },
  { re: /\b(i am|i'm) agree\b/gi, th: "agree เป็นกริยา: I agree (ไม่ใช้ am)" },
  { re: /\bdiscuss about\b/gi, th: "discuss ไม่ต้องมี about: discuss the issue" },
  { re: /\bin the other hand\b/gi, th: "สำนวนที่ถูกคือ On the other hand" },
  { re: /\balthough\b[^.]*,\s*but\b/gi, th: "ไม่ใช้ although กับ but ในประโยคเดียวกัน" },
  { re: /\b(he|she|it) (go|have|do|make|want|like|work|study|live)\b/gi, th: "ประธาน he/she/it + present simple ต้องเติม -s (ถ้าไม่ใช่ประโยคหลัง can/will/did)" },
  { re: /\b(don't|doesn't|can't|won't|isn't|aren't|it's|I'm|didn't)\b/g, th: "งานเขียนวิชาการควรใช้รูปเต็ม (do not, cannot, it is)" },
  { re: /\bvery very\b/gi, th: "หลีกเลี่ยง very very ใช้คำที่แรงขึ้น เช่น extremely" },
  { re: /\b(a lot of|lots of)\b/gi, th: "ใน Task 1/2 ลองใช้ a large number of / a significant amount of แทน (ไม่ผิด แต่ไม่เป็นทางการ)" },
];

export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

export function ruleCheck(text: string, task: 0 | 1 | 2, minWords: number): RuleFinding[] {
  const out: RuleFinding[] = [];
  const words = countWords(text);
  if (words < minWords) out.push({ level: "warn", th: `จำนวนคำ ${words} น้อยกว่าที่กำหนด (${minWords})${task ? " — ใน IELTS จะถูกลดคะแนน" : ""}` });
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  if (task === 2 && paragraphs < 4) out.push({ level: "warn", th: `มี ${paragraphs} ย่อหน้า — Task 2 ควรมี 4–5 ย่อหน้า (intro, body 2–3, conclusion) เว้นบรรทัดว่างระหว่างย่อหน้า` });
  if (task === 1 && paragraphs < 3) out.push({ level: "warn", th: `มี ${paragraphs} ย่อหน้า — Task 1 ควรมี 3–4 ย่อหน้า (intro, overview, body)` });

  const sentences = splitSentences(text);
  for (const s of sentences) {
    const n = countWords(s);
    if (n > 35) out.push({ level: "warn", th: `ประโยคยาว ${n} คำ — อาจอ่านยากและผิดง่าย ลองแบ่งเป็น 2 ประโยค`, quote: s });
  }
  const starts: Record<string, number> = {};
  for (const s of sentences) {
    const w = s.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (w) starts[w] = (starts[w] ?? 0) + 1;
  }
  for (const [w, n] of Object.entries(starts)) if (n >= 4 && sentences.length >= 6) out.push({ level: "info", th: `ขึ้นต้นประโยคด้วย "${w}" ${n} ครั้ง — ลองเปลี่ยนโครงสร้างประโยค` });

  const freq: Record<string, number> = {};
  for (const w of text.toLowerCase().match(/[a-z']+/g) ?? []) if (!STOP.has(w) && w.length > 3) freq[w] = (freq[w] ?? 0) + 1;
  const repeated = Object.entries(freq).filter(([, n]) => n >= (words > 200 ? 6 : 4)).map(([w, n]) => `${w} (${n})`);
  if (repeated.length) out.push({ level: "info", th: `คำที่ใช้ซ้ำบ่อย: ${repeated.join(", ")} — ลองหาคำพ้องหรือใช้สรรพนาม` });

  const linkers = (text.match(/\b(moreover|furthermore|in addition|additionally)\b/gi) ?? []).length;
  if (linkers >= 4) out.push({ level: "info", th: `ใช้ Moreover/Furthermore/In addition ${linkers} ครั้ง — ใช้มากเกินไปทำให้ดูเป็นกลไก (Coherence & Cohesion)` });

  if (task === 1) {
    if (!/\boverall\b|\bin general\b|\bit is clear that\b/i.test(text)) out.push({ level: "warn", th: "ไม่พบ overview (เช่น 'Overall, …') — Task 1 ต้องมีภาพรวม" });
    if (/\b(i think|in my opinion|i believe)\b/i.test(text)) out.push({ level: "warn", th: "Task 1 ไม่ควรมีความคิดเห็นส่วนตัว" });
    if (!/\d/.test(text)) out.push({ level: "warn", th: "ไม่พบตัวเลขเลย — ควรอ้างข้อมูลสำคัญประกอบ" });
  }
  if (task === 2 && !/\b(agree|disagree|believe|in my (view|opinion)|i think|i would argue)\b/i.test(text)) {
    out.push({ level: "info", th: "ไม่พบประโยคแสดงจุดยืนชัดเจน — โจทย์ส่วนใหญ่ต้องการความเห็นของคุณ" });
  }

  for (const p of PATTERNS) {
    const m = text.match(p.re);
    if (m) out.push({ level: "warn", th: p.th, quote: [...new Set(m)].slice(0, 3).join(" / ") });
  }
  if (!out.length) out.push({ level: "info", th: "ไม่พบปัญหาจากการตรวจเบื้องต้น (การตรวจแบบกฎตรวจได้เฉพาะรูปแบบที่พบบ่อย ไม่ใช่การตรวจไวยากรณ์ทั้งหมด)" });
  return out;
}

/** Pull "❌ original / ✅ corrected / หมวด / อธิบาย" blocks out of AI feedback so they can be saved. */
export function parseCorrections(text: string): { original: string; corrected: string; category: string; explanation: string }[] {
  const out: { original: string; corrected: string; category: string; explanation: string }[] = [];
  const re = /❌\s*"?([^\n"]+)"?\s*\n\s*✅\s*"?([^\n"]+)"?\s*(?:\n\s*หมวด:\s*([^\n]+))?\s*(?:\n\s*อธิบาย:\s*([^\n]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push({ original: m[1].trim(), corrected: m[2].trim(), category: (m[3] ?? "other").trim().toLowerCase(), explanation: (m[4] ?? "").trim() });
  }
  return out;
}
