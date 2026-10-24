export interface Phase {
  n: number;
  title: string;
  titleTh: string;
  months: string;
  /** Default length in weeks for a 9-month plan; stretched proportionally for longer plans. */
  weeks: number;
  focus: string[];
  /** Readiness criteria checked before the learner may move on. Evaluated in lib/stats.ts. */
  exitCriteriaTh: string[];
}

export const PHASES: Phase[] = [
  {
    n: 1,
    title: "Build B1 Foundations",
    titleTh: "ปูพื้นฐานระดับ B1",
    months: "เดือน 1–2",
    weeks: 8,
    focus: [
      "Grammar and sentence structure (tenses, S-V agreement, articles, linking)",
      "Everyday and academic vocabulary (≈ 300 words into the notebook)",
      "Pronunciation basics and listening comprehension (numbers, spelling, word stress)",
      "Reading for main ideas and details at B1",
      "Paragraph writing (topic sentence → support → conclusion)",
      "Speaking about familiar topics with Answer–Reason–Example",
    ],
    exitCriteriaTh: [
      "ทำบทเรียน Phase 1 ครบอย่างน้อย 80%",
      "ความแม่นยำ Reading และ Listening เฉลี่ย 5 ครั้งล่าสุด ≥ 60%",
      "มีคำศัพท์ในสมุดอย่างน้อย 100 คำ",
      "เขียนย่อหน้าอย่างน้อย 4 ชิ้น และฝึกพูดอย่างน้อย 8 ครั้ง",
    ],
  },
  {
    n: 2,
    title: "Develop the Four Skills",
    titleTh: "พัฒนาทักษะทั้งสี่",
    months: "เดือน 3–4",
    weeks: 8,
    focus: [
      "More challenging listening (longer talks, B1+ to B2)",
      "Reading comprehension and inference",
      "Coherent paragraphs and short essays (150–200 words)",
      "Speaking fluency and extended answers (1–2 minutes)",
      "Vocabulary expansion and error correction from the mistake notebook",
    ],
    exitCriteriaTh: [
      "ความแม่นยำ Reading และ Listening เฉลี่ย 5 ครั้งล่าสุด ≥ 65% ที่ระดับ B1+",
      "เขียน essay สั้นอย่างน้อย 4 ชิ้นพร้อมแก้ไข (revision)",
      "ข้อผิดพลาดในสมุดแก้สำเร็จแล้วอย่างน้อย 50%",
    ],
  },
  {
    n: 3,
    title: "IELTS Academic Skills",
    titleTh: "ทักษะเฉพาะ IELTS Academic",
    months: "เดือน 5–6",
    weeks: 9,
    focus: [
      "All Listening question types (Parts 1–4)",
      "All Reading question types incl. True/False/Not Given, Yes/No/Not Given, matching headings",
      "Writing Task 1: charts, graphs, tables, maps, processes",
      "Writing Task 2: opinion, discussion, advantages/disadvantages, problem/solution",
      "Speaking Parts 1, 2 and 3",
      "IELTS band descriptors and scoring criteria",
    ],
    exitCriteriaTh: [
      "ทำแบบฝึกครบทุกประเภทคำถาม และความแม่นยำแต่ละประเภท ≥ 60%",
      "เขียน Task 1 ครบ 5 ประเภทภาพ และ Task 2 ครบ 4 ประเภท",
      "ฝึก Speaking Part 2 ครบเวลา 2 นาทีอย่างน้อย 5 ครั้ง",
    ],
  },
  {
    n: 4,
    title: "Timed Practice",
    titleTh: "ฝึกจับเวลา",
    months: "เดือน 7–8",
    weeks: 9,
    focus: [
      "Timed individual skill tests",
      "Full-length mock exams when appropriate",
      "Error analysis after every test",
      "Targeted practice for the weakest skill",
      "Writing and Speaking feedback cycles",
    ],
    exitCriteriaTh: [
      "Listening และ Reading แบบเต็ม (40 ข้อ) อย่างน้อย 2 ครั้ง ได้ตามเกณฑ์โดยประมาณของ band 6.0+ (≈ 23/40) และควรถึง 6.5 (≈ 26–27/40)",
      "Writing/Speaking: ผ่าน checklist เกณฑ์ทุกข้ออย่างสม่ำเสมอ",
    ],
  },
  {
    n: 5,
    title: "Exam Readiness",
    titleTh: "พร้อมสอบ",
    months: "เดือน 9 (ขยายได้ถึงเดือน 12)",
    weeks: 4,
    focus: [
      "Full mock tests under realistic conditions",
      "Skill-specific score tracking",
      "Final revision of the mistake notebook",
      "Exam readiness assessment",
      "Book the real test only when practice results are consistent",
    ],
    exitCriteriaTh: [
      "ผลฝึกเต็มรูปแบบ 3 ครั้งล่าสุดของ Listening/Reading อยู่ในช่วงเป้าหมายอย่างสม่ำเสมอ",
      "Writing/Speaking ได้รับ feedback (ครู หรือ AI — ระบุว่าไม่เป็นทางการ) ที่ชี้ว่าทุกเกณฑ์ใกล้ระดับ 6.0+",
      "ถ้ายังไม่ถึง: ขยายแผนอีก 4–12 สัปดาห์ แทนการจองสอบ",
    ],
  },
];

/** Outline for weeks 5–8 (Phase 1 continued). Weeks 1–4 are detailed in data/lessons.ts. */
export const WEEKS_5_8: { week: number; themeTh: string; items: string[] }[] = [
  { week: 5, themeTh: "Present perfect & การเปลี่ยนแปลง | หัวข้อ Work", items: ["Listening: BBC 6 Minute English 2 ตอน + จดคำศัพท์", "Reading: British Council B1 reading 2 บท", "Writing: ย่อหน้าเปรียบเทียบอดีต/ปัจจุบัน", "Speaking: Part 1 Work + Part 2 'a job you would like'"] },
  { week: 6, themeTh: "Articles & countable/uncountable | หัวข้อ Food & Health", items: ["Listening L6 (Part 4 style) + ทบทวนการจดโน้ต", "Reading R5 summary completion", "Writing: ย่อหน้าแสดงความคิดเห็น", "Speaking: Part 1 Food"] },
  { week: 7, themeTh: "Passive voice | หัวข้อ Process & Environment", items: ["Writing Task 1 process (T1-process) ฉบับแรก", "Reading R6 (IELTS-style) ไม่จับเวลา", "Speaking: Part 3 คำถามเรื่องสิ่งแวดล้อม"] },
  { week: 8, themeTh: "ทบทวน Phase 1 + ประเมินความพร้อม", items: ["ทำแบบประเมินเริ่มต้นซ้ำเพื่อเทียบ", "ตรวจเกณฑ์ผ่าน Phase 1 ในหน้า แผนการเรียน", "เลือกทักษะที่อ่อนที่สุดเป็นจุดเน้นของ Phase 2"] },
];
