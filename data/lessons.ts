import type { Area, QType, Question, VocabSeed } from "@/lib/types";

export interface Lesson {
  id: string;
  day: number; // 1-based day of the plan
  week: number;
  area: Area;
  title: string;
  objective: string;
  objectiveTh: string;
  segments: { label: string; minutes: number }[];
  explanationTh: string[];
  examples: { en: string; th?: string }[];
  guided: Question[];
  independent: { th: string; link?: { href: string; label: string } };
  checkingTh: string;
  mistakeReviewTh: string[];
  vocab?: VocabSeed[];
}

const mcq = (id: string, prompt: string, options: string[], answer: string, explanationTh: string, qtype: QType = "grammar"): Question => ({
  id, kind: "mcq", qtype, prompt, options, answer: [answer], explanationTh,
});
const gap = (id: string, prompt: string, answer: string[], explanationTh: string, qtype: QType = "grammar"): Question => ({
  id, kind: "text", qtype, prompt, answer, explanationTh,
});

const STD = (learn: number, practice: number, review: number) => [
  { label: "เรียน/ทบทวนเนื้อหา", minutes: learn },
  { label: "ทำแบบฝึกหัด", minutes: practice },
  { label: "ตรวจคำตอบและทบทวนข้อผิดพลาด", minutes: review },
];

/**
 * First four weeks of the plan (from the start date in Settings, default Mon 9 Nov 2026).
 * Weekly rhythm: every skill appears at least once a week, grammar and vocabulary support
 * them, and Sunday is review. All content is original.
 */
export const LESSONS: Lesson[] = [
  // ───────────── WEEK 1: Me and my daily life — present tenses, sentence structure ─────────────
  {
    id: "d01", day: 1, week: 1, area: "assessment",
    title: "Initial assessment (diagnostic)",
    objective: "Find your real starting point in all four skills.",
    objectiveTh: "วัดจุดเริ่มต้นจริงของทั้ง 4 ทักษะ เพื่อปรับแผนให้ตรงกับคุณ (ไม่ใช่คะแนน IELTS)",
    segments: [
      { label: "Grammar & vocabulary (15 ข้อ)", minutes: 15 },
      { label: "Reading + Listening สั้น", minutes: 20 },
      { label: "Writing 60–100 คำ", minutes: 15 },
      { label: "Speaking 3 คำถาม + ประเมินตนเอง", minutes: 10 },
    ],
    explanationTh: [
      "วันนี้ยังไม่ต้องเรียนอะไรใหม่ ทำแบบประเมินให้ตรงกับความสามารถจริงที่สุด: ห้ามใช้ Google Translate หรือ AI ช่วย ข้อไหนไม่รู้ให้เดาหรือข้ามได้",
      "ผลที่ได้จะเป็น 'เปอร์เซ็นต์ความถูกต้อง' ของแต่ละส่วน ใช้เพื่อดูว่าทักษะไหนอ่อนที่สุด แอปจะไม่แปลงผลนี้เป็น band score เพราะแบบประเมินสั้น ๆ แบบนี้ไม่สามารถทำนายคะแนน IELTS จริงได้",
    ],
    examples: [],
    guided: [],
    independent: { th: "ทำแบบประเมินเริ่มต้นให้ครบทุกส่วน", link: { href: "/assessment", label: "เริ่มแบบประเมิน" } },
    checkingTh: "แอปตรวจ grammar, vocabulary, reading และ listening ให้อัตโนมัติ ส่วน writing และ speaking จะถูกเก็บไว้เป็น 'ตัวอย่างงานวันแรก' เพื่อเปรียบเทียบในเดือนถัดไป",
    mistakeReviewTh: ["ข้อที่ผิดจะถูกเพิ่มลงสมุดข้อผิดพลาดอัตโนมัติ ดูได้ที่เมนู 'สมุดข้อผิดพลาด'"],
  },
  {
    id: "d02", day: 2, week: 1, area: "grammar",
    title: "Sentence structure & present simple",
    objective: "Write correct Subject + Verb + Object sentences in the present simple.",
    objectiveTh: "เขียนประโยค ประธาน + กริยา + กรรม ด้วย present simple ได้ถูกต้อง โดยเฉพาะ -s/-es กับ he/she/it",
    segments: STD(15, 30, 15),
    explanationTh: [
      "ภาษาอังกฤษทุกประโยคต้องมี 'ประธาน' และ 'กริยาแท้' อย่างน้อยหนึ่งตัว ต่างจากภาษาไทยที่ละประธานได้บ่อย เช่น 'ชอบกินข้าวมันไก่' ภาษาอังกฤษต้องเป็น 'I like chicken rice.'",
      "Present simple ใช้กับ นิสัย กิจวัตร และความจริงทั่วไป ถ้าประธานเป็น he / she / it หรือคำนามเอกพจน์ (my mother, the city) ต้องเติม -s หรือ -es ที่กริยา: work → works, watch → watches, study → studies, have → has",
      "ประโยคปฏิเสธและคำถามใช้ do/does: She doesn't drive. Does he work here? — เมื่อมี does แล้ว กริยาหลักกลับเป็นรูปปกติ (ไม่เติม s)",
      "ข้อผิดพลาดที่คนไทยพบบ่อย: ลืม -s (He go to work), ใส่ is ซ้อนกับกริยา (I am work), และไม่มีกริยาในประโยค (My hometown very beautiful → My hometown is very beautiful)",
    ],
    examples: [
      { en: "I get up at six o'clock.", th: "ฉันตื่นนอนตอนหกโมง" },
      { en: "My brother works in a hospital.", th: "พี่ชายฉันทำงานที่โรงพยาบาล (works มี -s)" },
      { en: "She doesn't eat breakfast.", th: "เธอไม่กินอาหารเช้า (doesn't + eat ไม่เติม s)" },
      { en: "Bangkok is very hot in April.", th: "กรุงเทพฯ ร้อนมากในเดือนเมษายน (ต้องมี is)" },
    ],
    guided: [
      mcq("g1", "My father ______ to work by train.", ["go", "goes", "is go"], "goes", "ประธาน my father = he → goes (go + es)"),
      mcq("g2", "I ______ coffee every morning.", ["drink", "drinks", "am drink"], "drink", "ประธาน I ไม่เติม s และไม่ใช้ am ซ้อนกับกริยา"),
      mcq("g3", "She ______ like spicy food.", ["don't", "doesn't", "isn't"], "doesn't", "ปฏิเสธ present simple กับ she ใช้ doesn't + V1"),
      mcq("g4", "______ your sister study at university?", ["Do", "Does", "Is"], "Does", "your sister = she → Does … study?"),
      gap("g5", "Complete: My hometown ______ (be) very quiet.", ["is"], "ต้องมีกริยา be: My hometown is very quiet."),
      gap("g6", "Complete: He ______ (study) English every evening.", ["studies"], "study ลงท้าย พยัญชนะ+y → เปลี่ยน y เป็น i + es = studies"),
      gap("g7", "Correct the sentence: 'She watch TV at night.' → She ______ TV at night.", ["watches"], "watch ลงท้าย -ch → เติม es"),
      gap("g8", "Correct the sentence: 'I am live in Bangkok.' → I ______ in Bangkok.", ["live"], "ไม่ใช้ am กับกริยาแท้ใน present simple"),
    ],
    independent: { th: "เขียน 6 ประโยคเกี่ยวกับกิจวัตรประจำวันของคุณ และ 2 ประโยคเกี่ยวกับกิจวัตรของคนในครอบครัว (ใช้ he/she) บันทึกในตัวแก้ไข Writing หรือในสมุด", link: { href: "/writing?prompt=P1", label: "เปิดตัวแก้ไข Writing" } },
    checkingTh: "ตรวจตัวเองทีละประโยค: (1) มีประธานไหม (2) มีกริยาแท้ไหม (3) ถ้าเป็น he/she/it กริยาเติม -s หรือยัง (4) ไม่มี am/is/are ซ้อนกับกริยาอื่น ถ้าตั้งค่า AI แล้ว สามารถกด 'ขอ feedback' ในหน้า Writing ได้",
    mistakeReviewTh: ["He go → He goes", "I am work → I work", "My city very big → My city is very big", "Does she likes → Does she like"],
    vocab: [
      { en: "routine", th: "กิจวัตร", example: "My morning routine is simple.", ipa: "/ruːˈtiːn/", topic: "Daily life", level: "B1" },
      { en: "commute", th: "เดินทางไปทำงาน/เรียน", example: "I commute to work by BTS.", ipa: "/kəˈmjuːt/", topic: "Daily life", level: "B1" },
      { en: "usually", th: "โดยปกติ", example: "I usually get up at six.", ipa: "/ˈjuː.ʒu.ə.li/", topic: "Daily life", level: "A2" },
    ],
  },
  {
    id: "d03", day: 3, week: 1, area: "listening",
    title: "Listening for names, numbers and dates",
    objective: "Complete a form while listening, with correct spelling and numbers.",
    objectiveTh: "ฟังแล้วกรอกแบบฟอร์มได้ถูกต้อง: สะกดชื่อ ตัวเลข วันที่ และไม่หลงตัวลวง",
    segments: STD(15, 25, 20),
    explanationTh: [
      "ใน IELTS Listening Part 1 มักเป็นบทสนทนาเรื่องชีวิตประจำวัน (จองที่พัก สมัครสมาชิก) และให้กรอกแบบฟอร์ม คำตอบส่วนใหญ่เป็นชื่อ ตัวเลข วันที่ และคำนามสั้น ๆ",
      "ก่อนฟัง: อ่านโจทย์และเดาว่าช่องว่างต้องเป็นอะไร (ตัวเลข? ชื่อ? คำนาม?) และดูขีดจำกัดคำ เช่น ONE WORD AND/OR A NUMBER",
      "ระหว่างฟัง: ระวัง 'การแก้ไข' เช่น 'Oh, wait…', 'Actually…', 'No, sorry, it's…' คำตอบที่ถูกคือข้อมูลหลังการแก้ไข",
      "ตัวอักษรที่คนไทยสับสนบ่อยเวลาสะกด: A/E/I, G/J, B/V, M/N และ 'double L' แปลว่า LL",
    ],
    examples: [
      { en: "It's G-A-R-N-E-R.", th: "ฟังการสะกดชื่อทีละตัว" },
      { en: "That's double L.", th: "แปลว่ามี L สองตัวติดกัน" },
      { en: "The fifteenth… oh, wait, let's say the sixteenth.", th: "คำตอบคือ 16 (หลังการแก้ไข)" },
    ],
    guided: [
      mcq("g1", "In a form, the speaker says 'thirteen'. Which stress pattern did you hear?", ["thir-TEEN (stress at the end)", "THIR-ty (stress at the start)"], "thir-TEEN (stress at the end)", "13 เน้นพยางค์หลัง thirTEEN ส่วน 30 เน้นพยางค์แรก THIRty", "detail"),
      mcq("g2", "The speaker says: 'Swimming only… but actually, full membership.' What do you write?", ["swimming", "full"], "full", "ข้อมูลหลัง 'but actually' คือคำตอบ", "detail"),
      gap("g3", "Spell the letters: 'double S' in 'Ross' → R-O-__", ["ss", "s-s", "s s"], "double S = SS", "form-completion"),
      mcq("g4", "The instruction says 'ONE WORD AND/OR A NUMBER'. Which answer is NOT acceptable?", ["16", "March 16th 2027", "Garner"], "March 16th 2027", "เกินขีดจำกัดคำ จะถูกนับว่าผิดแม้ข้อมูลถูก", "form-completion"),
    ],
    independent: { th: "ทำแบบฝึกฟัง L1 'Joining a sports centre' (ฟังได้สูงสุด 2 รอบ) แล้วดูสคริปต์หลังส่งคำตอบ", link: { href: "/listening/L1", label: "เปิด Listening L1" } },
    checkingTh: "แอปตรวจคำตอบอัตโนมัติ คำที่สะกดผิดจะแสดงว่า 'สะกดผิด' และนับเป็นผิด (เหมือนข้อสอบจริง) หลังตรวจ ให้เลือกเหตุผลที่ผิดในแต่ละข้อ แล้วฟังซ้ำพร้อมอ่านสคริปต์",
    mistakeReviewTh: ["เขียนคำตอบก่อนการแก้ไขของผู้พูด", "สะกดชื่อผิดเพราะสับสน A/E", "เขียนเกินจำนวนคำที่กำหนด"],
  },
  {
    id: "d04", day: 4, week: 1, area: "reading",
    title: "Reading for the main idea",
    objective: "Find the main idea of each paragraph using topic sentences.",
    objectiveTh: "หาใจความหลักของแต่ละย่อหน้าจากประโยคใจความ (topic sentence)",
    segments: STD(15, 30, 15),
    explanationTh: [
      "ย่อหน้าภาษาอังกฤษแบบวิชาการส่วนใหญ่มีใจความหลักอยู่ในประโยคแรก (topic sentence) ประโยคถัดไปเป็นรายละเอียดหรือตัวอย่าง",
      "วิธีอ่าน: อ่านประโยคแรกและประโยคสุดท้ายของแต่ละย่อหน้าก่อน (ประมาณ 1–2 นาที) เพื่อดูภาพรวม แล้วค่อยอ่านละเอียดเฉพาะส่วนที่โจทย์ถาม",
      "คำถามเรื่องรายละเอียดมักใช้คำที่ 'ความหมายเดียวกันแต่ต่างคำ' (paraphrase) เช่น lack of time ↔ not enough time ฝึกสังเกตคำพ้องความหมาย",
    ],
    examples: [
      { en: "Walking is good for the mind, too.", th: "topic sentence → ย่อหน้านี้พูดเรื่องประโยชน์ต่อจิตใจ" },
      { en: "lowers blood pressure ↔ reduces blood pressure", th: "paraphrase ที่พบบ่อย" },
    ],
    guided: [
      mcq("g1", "'Many people find it difficult to walk regularly. The most common reason is a lack of time.' What is this paragraph about?", ["Reasons people don't walk", "How to walk faster", "The history of walking"], "Reasons people don't walk", "ประโยคแรกบอกปัญหา ประโยคที่สองบอกเหตุผล", "main-idea"),
      mcq("g2", "Which word is closest to 'reduce'?", ["lower", "raise", "keep"], "lower", "reduce = ลด ≈ lower", "vocab-in-context"),
      mcq("g3", "Where is the topic sentence usually found?", ["The first sentence", "The middle", "It is never written"], "The first sentence", "ในงานเขียนวิชาการ มักเป็นประโยคแรก", "main-idea"),
    ],
    independent: { th: "อ่าน R1 'The Benefits of Walking' ตอบคำถามทั้งหมด ลองอ่านแค่ประโยคแรกของทุกย่อหน้าก่อน 2 นาที", link: { href: "/reading/R1", label: "เปิด Reading R1" } },
    checkingTh: "แอปแสดงคำอธิบายและหลักฐาน (ประโยคจากบทความ) ทุกข้อ สำหรับข้อที่ผิด ให้ขีดเส้นใต้หลักฐานในใจแล้วอธิบายเป็นภาษาไทยว่าทำไมคำตอบถึงถูก",
    mistakeReviewTh: ["เลือกคำตอบจากความรู้ตัวเองแทนข้อมูลในบทความ", "เลือกตัวเลือกที่มีคำเหมือนในบทความ แต่ความหมายไม่ตรง"],
  },
  {
    id: "d05", day: 5, week: 1, area: "speaking",
    title: "Speaking Part 1: Answer – Reason – Example",
    objective: "Give 2–4 sentence answers about familiar topics.",
    objectiveTh: "ตอบคำถาม Part 1 เรื่องใกล้ตัวด้วยสูตร A-R-E ยาว 2–4 ประโยค ไม่ท่องจำ",
    segments: STD(10, 35, 15),
    explanationTh: [
      "Speaking Part 1 (4–5 นาที) ผู้สอบถามเรื่องใกล้ตัว เช่น บ้านเกิด งาน การเรียน งานอดิเรก คำตอบที่ดีไม่สั้นเกินไป (Yes, I do.) และไม่ยาวเป็นสุนทรพจน์",
      "สูตร A-R-E: Answer (ตอบตรง) → Reason (เหตุผล because…) → Example (ตัวอย่าง For example… / Last weekend…)",
      "ไม่ต้องใช้คำศัพท์ยาก ความเป็นธรรมชาติและความต่อเนื่องสำคัญกว่า ถ้าต้องคิด ใช้ 'Well, …' หรือ 'That's an interesting question…' แทนการเงียบ",
    ],
    examples: [
      { en: "Q: Do you like your hometown? — A: Yes, I really do. It's quite small, so it's peaceful and people know each other. For example, the woman at the market always remembers my name.", th: "Answer → Reason → Example" },
      { en: "Well, I'd say I'm more of a morning person, because I can focus better before lunch.", th: "ใช้ Well และ because" },
    ],
    guided: [
      mcq("g1", "Which answer is best for Part 1: 'Do you enjoy cooking?'", ["Yes.", "Yes, I do, because it helps me relax after work. I usually cook Thai curry at the weekend.", "Cooking is an activity that many people around the world do for different reasons, such as…"], "Yes, I do, because it helps me relax after work. I usually cook Thai curry at the weekend.", "ตอบตรง + เหตุผล + ตัวอย่าง ความยาวเหมาะสม", "detail"),
      mcq("g2", "Which phrase helps you gain thinking time naturally?", ["Ummmmmm…", "Well, let me think…", "I don't know."], "Well, let me think…", "เป็นวลีธรรมชาติที่ช่วยซื้อเวลา"),
    ],
    independent: { th: "บันทึกเสียงตอบคำถาม Part 1 หัวข้อ 'Home & hometown' และ 'Daily routine' อย่างน้อย 4 คำถาม (หัวข้อละ 2) ฟังเสียงตัวเองแล้วติ๊ก checklist", link: { href: "/speaking?part=1&topic=home", label: "เปิด Speaking Part 1" } },
    checkingTh: "ฟังเสียงตัวเองแล้วใช้ checklist: ตอบตรงไหม มีเหตุผล/ตัวอย่างไหม tense ถูกไหม เงียบนานเกิน 3 วินาทีไหม ถ้าเบราว์เซอร์ถอดเสียงได้ จะเห็นข้อความที่พูด ใช้ตรวจไวยากรณ์ได้",
    mistakeReviewTh: ["ตอบสั้นเกินไป (Yes / No)", "ท่องคำตอบยาวที่จำมา", "ใช้ present กับเรื่องในอดีต"],
  },
  {
    id: "d06", day: 6, week: 1, area: "writing",
    title: "Writing a clear paragraph",
    objective: "Write an 80–100 word paragraph with a topic sentence, support and conclusion.",
    objectiveTh: "เขียนย่อหน้า 80–100 คำ ที่มี topic sentence รายละเอียดสนับสนุน และประโยคสรุป",
    segments: STD(15, 30, 15),
    explanationTh: [
      "ย่อหน้าที่ดีมี 3 ส่วน: (1) Topic sentence บอกว่าย่อหน้านี้พูดเรื่องอะไร (2) Supporting sentences อธิบาย ให้เหตุผล ยกตัวอย่าง (3) Concluding sentence สรุปหรือให้ความเห็นสั้น ๆ",
      "ใช้คำเชื่อมบอกลำดับ: First, … Then, … After that, … Finally, … และคำเชื่อมเหตุผล because, so",
      "ทักษะนี้เป็นฐานของ IELTS Writing ทั้ง Task 1 และ Task 2 เพราะทุก body paragraph ใช้โครงสร้างเดียวกัน",
    ],
    examples: [
      { en: "On weekdays, my routine is busy but organised. I get up at 6 a.m. and take the BTS to work. I work from nine to six, and I usually have lunch with my colleagues. In the evening, I study English for one hour. One thing I would like to change is my bedtime, because I often stay up too late.", th: "ตัวอย่างย่อหน้า (topic → details → concluding)" },
    ],
    guided: [
      mcq("g1", "Which is the best topic sentence for a paragraph about your weekend?", ["I wake up at 8.", "My weekends are usually relaxing and family-focused.", "Saturday."], "My weekends are usually relaxing and family-focused.", "บอกภาพรวมของทั้งย่อหน้า ไม่ใช่รายละเอียดเดียว"),
      mcq("g2", "Which linking word shows a reason?", ["because", "then", "finally"], "because", "because = เพราะ"),
      gap("g3", "Complete with a sequence word: 'I have breakfast. ______, I go to work.'", ["then", "after that", "next"], "คำบอกลำดับ: Then / After that / Next"),
    ],
    independent: { th: "เขียนย่อหน้า 'My daily routine' (P1) 80–100 คำ ในตัวแก้ไข ใช้ checklist ด้านข้าง แล้วบันทึกเป็นฉบับแรก (Revision 1)", link: { href: "/writing?prompt=P1", label: "เขียนย่อหน้า P1" } },
    checkingTh: "ใช้ปุ่ม 'ตรวจเบื้องต้น' (ไม่ใช้ AI) เพื่อดูจำนวนคำ ประโยคยาวเกินไป และคำที่ใช้ซ้ำ จากนั้นติ๊ก checklist ถ้าตั้งค่า AI แล้ว กด 'ขอ feedback จาก AI' แล้วแก้เป็นฉบับที่ 2",
    mistakeReviewTh: ["ไม่มี topic sentence เริ่มด้วยรายละเอียดเลย", "ทุกประโยคเริ่มด้วย 'I' ซ้ำกัน", "ลืม -s กับ he/she"],
  },
  {
    id: "d07", day: 7, week: 1, area: "review",
    title: "Week 1 review",
    objective: "Review present simple, form completion and paragraph structure.",
    objectiveTh: "ทบทวนสัปดาห์ที่ 1: คำศัพท์ (spaced repetition) ข้อผิดพลาด และแบบทดสอบท้ายสัปดาห์",
    segments: [
      { label: "ทบทวนคำศัพท์ที่ถึงกำหนด", minutes: 15 },
      { label: "แบบทดสอบท้ายสัปดาห์", minutes: 20 },
      { label: "ฝึกจากสมุดข้อผิดพลาด", minutes: 20 },
      { label: "สะท้อนการเรียน", minutes: 5 },
    ],
    explanationTh: [
      "วันทบทวนสำคัญเท่ากับวันเรียนใหม่ งานวิจัยเรื่อง 'forgetting curve' แสดงว่าเราลืมเร็วมากถ้าไม่ทบทวน",
      "ทำตามลำดับ: (1) ทบทวนคำศัพท์ที่ถึงกำหนดในสมุดคำศัพท์ (2) ทำแบบทดสอบด้านล่าง (3) ฝึกแก้ข้อผิดพลาดของตัวเองในสมุดข้อผิดพลาด",
    ],
    examples: [],
    guided: [
      mcq("g1", "Every Sunday she ______ her grandmother.", ["visit", "visits", "is visit"], "visits", "she + V-s"),
      mcq("g2", "They ______ live near the university.", ["doesn't", "don't", "aren't"], "don't", "they + don't + V1"),
      gap("g3", "Complete: The library ______ (open) at 8 a.m.", ["opens"], "the library = it → opens"),
      mcq("g4", "A form says 'ONE WORD ONLY'. The answer is 'the city centre'. You write…", ["the city centre", "centre", "city centre"], "centre", "ต้องเป็นคำเดียวเท่านั้น (ดูจากโจทย์ว่าคำใดหายไป)", "form-completion"),
      mcq("g5", "Which sentence is a good topic sentence?", ["I eat rice.", "Food plays an important role in my family life.", "Next, we eat."], "Food plays an important role in my family life.", "บอกใจความหลักกว้างพอสำหรับทั้งย่อหน้า"),
      gap("g6", "Correct: 'My hometown very small.' → My hometown ______ very small.", ["is"], "ประโยคต้องมีกริยา"),
    ],
    independent: { th: "ทบทวนคำศัพท์ที่ถึงกำหนด แล้วฝึก 'ทำแบบฝึกจากข้อผิดพลาด' ในสมุดข้อผิดพลาดอย่างน้อย 5 ข้อ", link: { href: "/mistakes?practice=1", label: "ฝึกจากข้อผิดพลาด" } },
    checkingTh: "แบบทดสอบตรวจอัตโนมัติ ในสมุดข้อผิดพลาด พิมพ์ประโยคที่แก้แล้ว แอปเปรียบเทียบกับคำตอบที่ถูก ถ้าถูก 2 ครั้งติดกันจะนับว่า 'แก้ไขสำเร็จ'",
    mistakeReviewTh: ["เขียนสิ่งที่ยังทำผิดซ้ำ 1–2 ข้อไว้ในช่องบันทึกของบทเรียนนี้"],
  },

  // ───────────── WEEK 2: Education & learning — past tenses, T/F/NG ─────────────
  {
    id: "d08", day: 8, week: 2, area: "grammar",
    title: "Past simple vs present perfect",
    objective: "Choose between past simple and present perfect correctly.",
    objectiveTh: "เลือกใช้ past simple กับ present perfect ได้ถูกต้อง",
    segments: STD(20, 25, 15),
    explanationTh: [
      "Past simple (V2) ใช้กับเหตุการณ์ที่จบแล้วและ 'ระบุเวลาในอดีต' เช่น yesterday, last year, in 2019, when I was a child: I graduated in 2020.",
      "Present perfect (have/has + V3) ใช้กับประสบการณ์ที่ไม่ระบุเวลา หรือสิ่งที่เริ่มในอดีตและยังต่อเนื่องถึงปัจจุบัน: I have studied English for ten years. She has visited Japan twice.",
      "คำที่มักใช้กับ present perfect: for, since, ever, never, already, yet, just ส่วนคำที่ใช้กับ past simple: ago, yesterday, last…, in + ปี",
      "จุดที่คนไทยผิดบ่อย: ใช้ present perfect กับเวลาที่ระบุ ✗ I have gone there last year → ✓ I went there last year",
    ],
    examples: [
      { en: "I started learning English in primary school.", th: "เวลาในอดีตที่ระบุ → past simple" },
      { en: "I have studied English since 2015.", th: "เริ่มในอดีต ยังเรียนอยู่ → present perfect" },
      { en: "Have you ever taken an English test?", th: "ประสบการณ์ ไม่ระบุเวลา" },
    ],
    guided: [
      mcq("g1", "I ______ my degree two years ago.", ["have finished", "finished", "finish"], "finished", "two years ago = เวลาในอดีตที่ระบุ"),
      mcq("g2", "She ______ in Bangkok since 2018.", ["lived", "has lived", "lives"], "has lived", "since 2018 → present perfect"),
      mcq("g3", "______ you ever ______ to Singapore?", ["Did / go", "Have / been", "Do / go"], "Have / been", "ประสบการณ์ + ever"),
      gap("g4", "Past of 'study': I ______ hard for the exam last month.", ["studied"], "study → studied"),
      gap("g5", "Past of 'teach': Mr Lee ______ me maths in Grade 10.", ["taught"], "teach → taught (กริยาอปกติ)"),
      gap("g6", "Complete: I have ______ (know) her for five years.", ["known"], "know → knew → known"),
    ],
    independent: { th: "เขียน 5 ประโยค past simple เกี่ยวกับการเรียนในอดีตของคุณ และ 3 ประโยค present perfect เกี่ยวกับประสบการณ์เรียนภาษาอังกฤษ", link: { href: "/writing?prompt=P2", label: "เปิดตัวแก้ไข (P2)" } },
    checkingTh: "ตรวจ: ประโยคที่มีเวลาในอดีตระบุชัดต้องเป็น V2, ประโยคที่มี for/since/ever ต้องเป็น have/has + V3 จดกริยาอปกติที่ผิดลงสมุดคำศัพท์",
    mistakeReviewTh: ["I have gone there last year → I went there last year", "I study here since 2020 → I have studied here since 2020", "teached → taught"],
    vocab: [
      { en: "graduate", th: "จบการศึกษา", example: "I graduated in 2020.", ipa: "/ˈɡrædʒ.u.eɪt/", topic: "Education", level: "B1" },
      { en: "degree", th: "ปริญญา", example: "She has a degree in economics.", ipa: "/dɪˈɡriː/", topic: "Education", level: "B1" },
    ],
  },
  {
    id: "d09", day: 9, week: 2, area: "listening",
    title: "Multiple choice and distractors",
    objective: "Avoid distractors in multiple-choice listening questions.",
    objectiveTh: "ทำคำถามเลือกตอบในการฟังโดยไม่หลงตัวลวง (distractors)",
    segments: STD(15, 25, 20),
    explanationTh: [
      "ในคำถาม multiple choice ผู้พูดมักพูดถึง 'ทุกตัวเลือก' แต่มีเพียงตัวเลือกเดียวที่ถูก ตัวเลือกอื่นเป็นตัวลวง",
      "สัญญาณที่บอกว่าคำตอบกำลังมา: but, actually, in fact, however, the main… และโครงสร้าง 'not X but Y' (คำตอบคือ Y)",
      "ก่อนฟัง ขีดเส้นใต้คำสำคัญในคำถาม (เช่น 'at the weekend', 'most questions') และระวังคำที่บอกเงื่อนไข เช่น weekdays vs weekend",
    ],
    examples: [
      { en: "Many students think it's only for borrowing books, but most questions are actually about printing.", th: "คำตอบ: printing" },
    ],
    guided: [
      mcq("g1", "'We used to meet on Mondays, but now we meet on Fridays.' When do they meet now?", ["Monday", "Friday"], "Friday", "used to = อดีต, now = ปัจจุบัน", "detail"),
      mcq("g2", "'Not the blue one — the green one is mine.' Which is the speaker's?", ["blue", "green"], "green", "not X but Y → Y", "detail"),
    ],
    independent: { th: "ทำ Listening L2 'A university library tour'", link: { href: "/listening/L2", label: "เปิด Listening L2" } },
    checkingTh: "หลังตรวจ เปิดสคริปต์และหาประโยคที่เป็นตัวลวงของข้อที่ผิด เลือกเหตุผล 'ถูกตัวลวง' เพื่อติดตามสถิติ",
    mistakeReviewTh: ["เลือกคำตอบที่ได้ยินก่อน", "ไม่สังเกต weekday/weekend"],
  },
  {
    id: "d10", day: 10, week: 2, area: "reading",
    title: "Introduction to True / False / Not Given",
    objective: "Tell the difference between FALSE and NOT GIVEN.",
    objectiveTh: "แยกความต่างระหว่าง FALSE (ขัดแย้ง) กับ NOT GIVEN (ไม่มีข้อมูล) ได้",
    segments: STD(20, 25, 15),
    explanationTh: [
      "TRUE = ข้อความตรงกับข้อมูลในบทความ (มักเป็น paraphrase)",
      "FALSE = บทความให้ข้อมูลที่ 'ขัดแย้ง' กับข้อความ เช่น ข้อความบอก all แต่บทความบอก some",
      "NOT GIVEN = บทความ 'ไม่มีข้อมูล' พอที่จะบอกว่าจริงหรือไม่ ห้ามใช้ความรู้ทั่วไปหรือการเดา",
      "ระวังคำที่เปลี่ยนความหมาย: all/some/most, always/often/rarely, more/less, can/must — คำเดียวเปลี่ยนคำตอบจาก TRUE เป็น FALSE ได้",
    ],
    examples: [
      { en: "Passage: 'Some online courses are free.' — Statement: 'All online courses cost money.' → FALSE", th: "ขัดแย้งกัน" },
      { en: "Passage: (nothing about age) — Statement: 'Most users are teenagers.' → NOT GIVEN", th: "ไม่มีข้อมูล" },
    ],
    guided: [
      mcq("g1", "Passage: 'The museum opens every day except Monday.' Statement: 'The museum is closed on Mondays.'", ["True", "False", "Not Given"], "True", "except Monday = ปิดวันจันทร์", "tfng"),
      mcq("g2", "Passage: 'The museum opens every day except Monday.' Statement: 'Entry to the museum is free.'", ["True", "False", "Not Given"], "Not Given", "ไม่มีข้อมูลเรื่องราคา", "tfng"),
      mcq("g3", "Passage: 'Most students passed the test.' Statement: 'All the students passed.'", ["True", "False", "Not Given"], "False", "most ≠ all", "tfng"),
    ],
    independent: { th: "ทำ Reading R2 'Learning Languages Online' (TFNG 6 ข้อ)", link: { href: "/reading/R2", label: "เปิด Reading R2" } },
    checkingTh: "ทุกข้อมีหลักฐานจากบทความ ข้อที่ตอบ FALSE แต่เฉลยเป็น NOT GIVEN (หรือกลับกัน) ให้เขียนเหตุผลภาษาไทยหนึ่งบรรทัดในสมุดข้อผิดพลาด",
    mistakeReviewTh: ["ใช้ความรู้ตัวเองตอบ TRUE", "สับสน FALSE กับ NOT GIVEN", "ไม่สังเกตคำว่า all / some"],
  },
  {
    id: "d11", day: 11, week: 2, area: "writing",
    title: "Writing about past experiences",
    objective: "Write a 100–120 word paragraph using past tenses and time linkers.",
    objectiveTh: "เขียนย่อหน้าเล่าประสบการณ์ 100–120 คำ ใช้ past simple และคำเชื่อมเวลาได้ถูกต้อง",
    segments: STD(10, 35, 15),
    explanationTh: [
      "การเล่าเรื่องในอดีตต้องใช้ past simple อย่างสม่ำเสมอ ปัญหาที่พบบ่อยคือเริ่มด้วย past แล้วเปลี่ยนเป็น present กลางย่อหน้า",
      "คำเชื่อมเวลา: When I was…, At first, …, After a few weeks, …, Eventually, …, Since then, … (since then ตามด้วย present perfect)",
      "ปิดย่อหน้าด้วยความหมายของประสบการณ์ต่อชีวิตปัจจุบัน ซึ่งเป็นทักษะที่ใช้ใน Speaking Part 2 ด้วย",
    ],
    examples: [
      { en: "When I was in Grade 11, I joined an English camp. At first, I was too shy to speak. After a few days, however, I started to make friends. Since then, I have felt more confident.", th: "ตัวอย่างการใช้คำเชื่อมเวลา" },
    ],
    guided: [
      mcq("g1", "Choose the correct linker: '______ I was a child, I lived in Khon Kaen.'", ["When", "Since then", "Eventually"], "When", "When + ประโยคอดีต"),
      mcq("g2", "'Since then, I ______ more confident.'", ["felt", "have felt", "feel"], "have felt", "Since then → present perfect"),
      gap("g3", "Past of 'feel': I ______ nervous before the presentation.", ["felt"], "feel → felt"),
    ],
    independent: { th: "เขียน P2 'A memorable learning experience' 100–120 คำ บันทึกเป็นฉบับที่ 1 แล้วตรวจเบื้องต้น แก้ไขเป็นฉบับที่ 2", link: { href: "/writing?prompt=P2", label: "เขียน P2" } },
    checkingTh: "ไฮไลต์กริยาทุกตัวในใจ: เรื่องอดีตต้องเป็น V2 เปรียบเทียบฉบับ 1 และ 2 ในประวัติการแก้ไข",
    mistakeReviewTh: ["เปลี่ยน tense กลางเรื่อง", "Since then + past simple"],
  },
  {
    id: "d12", day: 12, week: 2, area: "speaking",
    title: "Part 1 study + first Part 2 cue card",
    objective: "Speak for 1 minute about a person using the cue card points.",
    objectiveTh: "พูดต่อเนื่อง 1 นาทีเกี่ยวกับบุคคลโดยใช้หัวข้อในการ์ดคำถาม (cue card)",
    segments: STD(10, 35, 15),
    explanationTh: [
      "Part 2: ผู้สอบให้การ์ดหัวข้อ มีเวลาเตรียม 1 นาที แล้วพูด 1–2 นาที ตอนเริ่มต้นเป้าหมายคือพูดให้ได้ 1 นาทีก่อน แล้วค่อยเพิ่มเป็น 2 นาทีใน Phase 2–3",
      "ช่วงเตรียม 1 นาที: จดคำสำคัญ (keywords) ไม่ใช่ประโยคเต็ม ตามหัวข้อย่อยบนการ์ด",
      "เรื่องที่เกิดในอดีตใช้ past simple เช่น 'She taught me…' และใช้ present สำหรับสิ่งที่ยังเป็นจริง 'I still remember her because…'",
    ],
    examples: [
      { en: "I'd like to talk about Ms Suda, who taught me English in Grade 9. She was strict but kind…", th: "เปิดเรื่องด้วยประโยคแนะนำ" },
    ],
    guided: [
      mcq("g1", "In the 1-minute preparation, you should…", ["write full sentences", "write keywords for each point", "do nothing"], "write keywords for each point", "จดคำสำคัญเร็วกว่าและไม่ทำให้อ่านโน้ตตอนพูด"),
      mcq("g2", "Best opening line for 'Describe a teacher who helped you':", ["Teacher.", "I'd like to talk about my English teacher, Mr Lee.", "Teachers are important in society."], "I'd like to talk about my English teacher, Mr Lee.", "เปิดตรงหัวข้อ"),
    ],
    independent: { th: "ตอบ Part 1 หัวข้อ 'Work or study' 2 คำถาม แล้วทำ Part 2 'Describe a teacher who helped you' (เตรียม 1 นาที พูด 1–2 นาที) บันทึกเสียง", link: { href: "/speaking?part=2&card=teacher", label: "เปิด Part 2 cue card" } },
    checkingTh: "ดูเวลาที่พูดได้ (แอปจับเวลาให้) และอ่าน transcript ถ้ามี หาประโยค tense ผิด 2 ประโยคแล้วพูดใหม่ (Try again)",
    mistakeReviewTh: ["หยุดพูดก่อน 1 นาที", "ใช้ present กับเรื่องในอดีต", "อ่านโน้ตเป็นประโยค"],
  },
  {
    id: "d13", day: 13, week: 2, area: "vocab",
    title: "Education collocations & word stress",
    objective: "Use 10 education collocations and say them with correct stress.",
    objectiveTh: "ใช้ collocation เรื่องการศึกษา 10 คำ และออกเสียงเน้นพยางค์ (word stress) ถูกต้อง",
    segments: STD(15, 30, 15),
    explanationTh: [
      "Collocation คือคำที่มักใช้คู่กัน เช่น 'make progress' ไม่ใช่ 'do progress' การใช้ collocation ถูกช่วยคะแนน Lexical Resource ทั้ง Writing และ Speaking",
      "Word stress: คำหลายพยางค์ต้องเน้นพยางค์ที่ถูก เช่น eDUcation, uniVERsity, aCAdemic ถ้าเน้นผิด ผู้ฟังอาจไม่เข้าใจ",
      "วิธีฝึก: เปิดพจนานุกรม Cambridge หรือ Oxford (ดูในหน้าแหล่งเรียนรู้) ฟังเสียง แล้วพูดตาม 3 ครั้ง",
    ],
    examples: [
      { en: "attend a lecture / submit an assignment / take notes / make progress / do research", th: "เข้าฟังบรรยาย / ส่งงาน / จดโน้ต / มีความก้าวหน้า / ทำวิจัย" },
      { en: "pass an exam / fail an exam / get a degree / meet a deadline", th: "สอบผ่าน / สอบตก / ได้ปริญญา / ส่งงานทันกำหนด" },
    ],
    guided: [
      mcq("g1", "I need to ______ my assignment by Friday.", ["give", "submit", "make"], "submit", "submit an assignment", "vocabulary"),
      mcq("g2", "Students should ______ notes during lectures.", ["take", "do", "write up"], "take", "take notes", "vocabulary"),
      mcq("g3", "She is ______ good progress in English.", ["doing", "making", "having"], "making", "make progress", "vocabulary"),
      mcq("g4", "Which syllable is stressed in 'university'?", ["U-ni-ver-si-ty (first)", "u-ni-VER-si-ty (third)", "u-ni-ver-si-TY (last)"], "u-ni-VER-si-ty (third)", "uniVERsity", "vocabulary"),
      gap("g5", "Complete: Did you ______ the deadline? (manage to finish on time)", ["meet"], "meet a deadline", "vocabulary"),
    ],
    independent: { th: "เพิ่ม collocation ทั้ง 6 คำในบทนี้ลงสมุดคำศัพท์ (กดปุ่ม + ด้านล่าง) แล้วเขียนประโยคตัวอย่างของคุณเองคำละ 1 ประโยค", link: { href: "/vocabulary", label: "เปิดสมุดคำศัพท์" } },
    checkingTh: "ตรวจ collocation กับพจนานุกรม Cambridge/Oxford ถ้าไม่แน่ใจว่าคำคู่กันได้หรือไม่ ให้ค้นวลีทั้งวลีในพจนานุกรม",
    mistakeReviewTh: ["do homework ✓ / make homework ✗", "make a mistake ✓ / do a mistake ✗", "เน้นเสียง EDucation ✗"],
    vocab: [
      { en: "attend a lecture", th: "เข้าฟังการบรรยาย", example: "I attend two lectures on Mondays.", topic: "Education", level: "B1" },
      { en: "submit an assignment", th: "ส่งงาน", example: "We must submit the assignment online.", topic: "Education", level: "B2" },
      { en: "take notes", th: "จดโน้ต", example: "I take notes on my tablet.", topic: "Education", level: "B1" },
      { en: "make progress", th: "มีความก้าวหน้า", example: "I am making progress in listening.", topic: "Education", level: "B1" },
      { en: "meet a deadline", th: "ทำเสร็จทันกำหนด", example: "It is hard to meet every deadline.", topic: "Education", level: "B2" },
      { en: "do research", th: "ทำวิจัย/ค้นคว้า", example: "She is doing research on climate change.", topic: "Education", level: "B1" },
    ],
  },
  {
    id: "d14", day: 14, week: 2, area: "review",
    title: "Week 2 review",
    objective: "Review past tenses, distractors and TFNG.",
    objectiveTh: "ทบทวนสัปดาห์ที่ 2: past tenses, ตัวลวงในการฟัง และ TFNG",
    segments: [
      { label: "ทบทวนคำศัพท์ที่ถึงกำหนด", minutes: 15 },
      { label: "แบบทดสอบท้ายสัปดาห์", minutes: 20 },
      { label: "ฝึกจากสมุดข้อผิดพลาด", minutes: 20 },
      { label: "สะท้อนการเรียน", minutes: 5 },
    ],
    explanationTh: ["ทำตามลำดับเดิม: คำศัพท์ → แบบทดสอบ → ข้อผิดพลาด ดูสถิติในหน้า ความก้าวหน้า ว่าทักษะไหนมีความแม่นยำต่ำสุด"],
    examples: [],
    guided: [
      mcq("g1", "We ______ the museum last Sunday.", ["have visited", "visited", "visit"], "visited", "last Sunday → past simple"),
      mcq("g2", "I ______ never ______ sushi.", ["have / eaten", "did / eat", "was / eaten"], "have / eaten", "never + ประสบการณ์ → present perfect"),
      mcq("g3", "Passage: 'Prices rose slightly in 2025.' Statement: 'Prices fell in 2025.'", ["True", "False", "Not Given"], "False", "rose ≠ fell", "tfng"),
      mcq("g4", "Passage: 'Prices rose slightly in 2025.' Statement: 'Prices will rise again in 2026.'", ["True", "False", "Not Given"], "Not Given", "ไม่มีข้อมูลอนาคต", "tfng"),
      mcq("g5", "Students must ______ their essays before Friday.", ["submit", "attend", "take"], "submit", "submit essays", "vocabulary"),
      gap("g6", "Past of 'buy': I ______ a new laptop for university.", ["bought"], "buy → bought"),
    ],
    independent: { th: "ทบทวนคำศัพท์ที่ถึงกำหนด และฝึกจากสมุดข้อผิดพลาด", link: { href: "/mistakes?practice=1", label: "ฝึกจากข้อผิดพลาด" } },
    checkingTh: "ตรวจอัตโนมัติ เปรียบเทียบคะแนนกับแบบทดสอบสัปดาห์ที่ 1 ในหน้าความก้าวหน้า",
    mistakeReviewTh: ["เขียนข้อผิดพลาดที่ยังเกิดซ้ำในช่องบันทึก"],
  },

  // ───────────── WEEK 3: Cities & technology — comparisons, numbers, Task 1 preview ─────────────
  {
    id: "d15", day: 15, week: 3, area: "grammar",
    title: "Comparisons and numbers",
    objective: "Compare things and describe numbers and percentages accurately.",
    objectiveTh: "เปรียบเทียบสิ่งต่าง ๆ และอธิบายตัวเลข/เปอร์เซ็นต์ได้ถูกต้อง (เตรียมสำหรับ Writing Task 1)",
    segments: STD(20, 25, 15),
    explanationTh: [
      "คำคุณศัพท์สั้น (1 พยางค์): -er / -est เช่น cheap → cheaper → the cheapest; คำยาว (2+ พยางค์ส่วนใหญ่): more / the most เช่น expensive → more expensive",
      "ห้ามใช้ซ้อน: ✗ more cheaper ✗ more better ✓ cheaper ✓ better",
      "การเปรียบเทียบตัวเลข: twice as many as (มากเป็นสองเท่า), half as much as, slightly higher (สูงกว่าเล็กน้อย), significantly lower (ต่ำกว่ามาก)",
      "เปอร์เซ็นต์และสัดส่วน: 25% = a quarter, 50% = half, 33% = a third, 75% = three quarters; ใช้ 'the proportion of' หรือ 'the percentage of'",
    ],
    examples: [
      { en: "Bus travel is cheaper than taxi travel.", th: "cheap → cheaper" },
      { en: "Bangkok is more crowded than Chiang Mai.", th: "crowded → more crowded" },
      { en: "Twice as many students cycled in 2025 as in 2015.", th: "มากเป็นสองเท่า" },
      { en: "The proportion of students who drove fell to a quarter.", th: "สัดส่วนลดลงเหลือหนึ่งในสี่" },
    ],
    guided: [
      mcq("g1", "The train is ______ than the bus.", ["fast", "faster", "more faster"], "faster", "fast (1 พยางค์) → faster"),
      mcq("g2", "This is the ______ city in the country.", ["most modern", "modernest", "more modern"], "most modern", "modern → the most modern"),
      mcq("g3", "Air quality is ______ in the countryside.", ["more better", "better", "gooder"], "better", "good → better (อปกติ)"),
      gap("g4", "50% = ______ (one word)", ["half"], "50% = half"),
      gap("g5", "25% = a ______", ["quarter"], "25% = a quarter"),
      mcq("g6", "In 2015, 10% cycled. In 2025, 20% cycled. Cycling was ______ as popular in 2025.", ["twice", "half", "three times"], "twice", "20 = 2 × 10"),
    ],
    independent: { th: "เขียน 6 ประโยคเปรียบเทียบเมืองที่คุณอยู่กับเมืองอื่น (ราคา การเดินทาง อากาศ) ใช้ทั้ง -er และ more", link: { href: "/writing?prompt=T1-bar", label: "เปิดตัวแก้ไข" } },
    checkingTh: "ตรวจ: คำ 1 พยางค์ใช้ -er, คำยาวใช้ more, ไม่มี 'more + -er' และมี than หลังคำเปรียบเทียบ",
    mistakeReviewTh: ["more cheaper → cheaper", "more better → better", "lower than → ลืม than"],
    vocab: [
      { en: "proportion", th: "สัดส่วน", example: "The proportion of cyclists increased.", ipa: "/prəˈpɔː.ʃən/", topic: "Data", level: "B2" },
      { en: "significantly", th: "อย่างมีนัยสำคัญ, มาก", example: "Car use fell significantly.", ipa: "/sɪɡˈnɪf.ɪ.kənt.li/", topic: "Data", level: "B2" },
      { en: "slightly", th: "เล็กน้อย", example: "Bus use rose slightly.", ipa: "/ˈslaɪt.li/", topic: "Data", level: "B1" },
    ],
  },
  {
    id: "d16", day: 16, week: 3, area: "listening",
    title: "Numbers, percentages and 13 vs 30",
    objective: "Hear and write numbers correctly.",
    objectiveTh: "ฟังและเขียนตัวเลขได้ถูก โดยเฉพาะ -teen กับ -ty",
    segments: STD(15, 25, 20),
    explanationTh: [
      "ตัวเลข -teen (13–19) เน้นพยางค์หลัง: thirTEEN, fifTEEN ส่วน -ty (30–90) เน้นพยางค์แรก: THIRty, FIFty และเสียง t ใน -ty มักเบาลงในสำเนียงอเมริกัน",
      "ฟังหน่วยด้วย: kilometres, percent, minutes เพราะช่วยยืนยันตัวเลข",
      "ใน IELTS เขียนเป็นตัวเลข (13) ดีกว่าสะกดเป็นคำ เพราะเร็วกว่าและลดโอกาสสะกดผิด",
    ],
    examples: [
      { en: "fourteen (14) vs forty (40)", th: "four-TEEN vs FOR-ty" },
      { en: "half past seven = 7.30 / a quarter to nine = 8.45", th: "การบอกเวลา" },
    ],
    guided: [
      mcq("g1", "'a quarter to nine' =", ["8.45", "9.15", "8.15"], "8.45", "อีก 15 นาทีจะ 9 โมง", "detail"),
      mcq("g2", "Stress pattern for 'sixty':", ["SIX-ty", "six-TY"], "SIX-ty", "-ty เน้นพยางค์แรก", "detail"),
      gap("g3", "Write as a number: 'two thousand and twenty-seven'", ["2027"], "2027", "note-completion"),
    ],
    independent: { th: "ทำ Listening L3 'City transport survey' — ลองตั้งความเร็วเสียง 1.0 ถ้าทำได้ดี", link: { href: "/listening/L3", label: "เปิด Listening L3" } },
    checkingTh: "ถ้าผิดเรื่องตัวเลข เลือกเหตุผล 'ตัวเลข/วันที่ผิด' แล้วฟังเฉพาะประโยคนั้นซ้ำ 3 ครั้ง",
    mistakeReviewTh: ["13 ↔ 30", "ลืมหน่วย (%, km)", "เขียน 'twenty' ผิดเป็น 'twelve'"],
  },
  {
    id: "d17", day: 17, week: 3, area: "writing",
    title: "Task 1 preview: describing a bar chart",
    objective: "Write an overview and two comparisons for a bar chart (~80 words).",
    objectiveTh: "เขียน overview และการเปรียบเทียบ 2 จุดจากกราฟแท่ง (~80 คำ) — ก้าวแรกสู่ Writing Task 1",
    segments: STD(20, 25, 15),
    explanationTh: [
      "Writing Task 1 (Academic) ให้อธิบายข้อมูลจากภาพ อย่างน้อย 150 คำใน 20 นาที วันนี้ฝึกเพียงสองส่วนที่สำคัญที่สุด: overview และการเปรียบเทียบ",
      "Overview = ภาพรวม 1–2 ประโยค บอกแนวโน้มหลักหรือความแตกต่างที่เด่นที่สุด โดยไม่ต้องใส่ตัวเลข ขึ้นต้นด้วย 'Overall, …' ถ้าไม่มี overview คะแนน Task Achievement จะถูกจำกัด",
      "การเปรียบเทียบ: เลือกข้อมูลที่ต่างกันชัด และอ้างตัวเลขประกอบ เช่น 'The proportion of students who drove fell from 45% to 25%.'",
      "ห้ามใส่ความเห็นหรือเหตุผลที่ไม่มีในกราฟ เช่น 'because petrol is expensive'",
    ],
    examples: [
      { en: "Overall, driving became much less common, while cycling became considerably more popular.", th: "overview: ไม่มีตัวเลข บอกแนวโน้มหลัก" },
      { en: "Car use dropped from 45% to 25%, whereas cycling rose from 10% to 25%.", th: "เปรียบเทียบพร้อมตัวเลข ใช้ whereas" },
    ],
    guided: [
      mcq("g1", "Which is the best overview?", ["In 2015, 45% drove.", "Overall, car use fell while cycling increased.", "I think cycling is healthy."], "Overall, car use fell while cycling increased.", "overview บอกแนวโน้มหลัก ไม่ใส่ตัวเลข และไม่ใส่ความเห็น"),
      mcq("g2", "Which sentence should NOT be in Task 1?", ["Walking remained unchanged at 15%.", "This is because buses became cheaper.", "Bus use rose slightly."], "This is because buses became cheaper.", "เหตุผลไม่มีในข้อมูล"),
      mcq("g3", "Data: 2015 = 30%, 2025 = 35%. Best verb phrase:", ["rose slightly", "rose dramatically", "fell"], "rose slightly", "เพิ่ม 5% = เล็กน้อย"),
    ],
    independent: { th: "ดูกราฟ T1-bar แล้วเขียน overview 1 ประโยค + การเปรียบเทียบ 2 ประโยค (~80 คำ) ในตัวแก้ไข", link: { href: "/writing?prompt=T1-bar", label: "เปิด Task 1 bar chart" } },
    checkingTh: "ใช้ checklist Task 1 (overview / key features / comparisons / no opinion) ถ้ามี AI ให้ขอ feedback — AI จะไม่ให้ band score สำหรับงานที่สั้นกว่า 150 คำ",
    mistakeReviewTh: ["ไม่มี overview", "ไล่ตัวเลขทุกตัวโดยไม่เปรียบเทียบ", "ใส่เหตุผลหรือความเห็น"],
    vocab: [
      { en: "whereas", th: "ในขณะที่ (เปรียบเทียบความต่าง)", example: "Car use fell, whereas cycling rose.", ipa: "/weəˈræz/", topic: "Linking", level: "B2" },
      { en: "remain unchanged", th: "คงที่ ไม่เปลี่ยนแปลง", example: "Walking remained unchanged at 15%.", topic: "Data", level: "B2" },
    ],
  },
  {
    id: "d18", day: 18, week: 3, area: "reading",
    title: "Skimming, scanning and matching headings",
    objective: "Skim for headings and scan for specific numbers and names.",
    objectiveTh: "อ่านเร็วเพื่อจับคู่หัวข้อ (skimming) และกวาดตาหาข้อมูลเฉพาะ (scanning)",
    segments: STD(15, 30, 15),
    explanationTh: [
      "Skimming: อ่านเร็วเพื่อเข้าใจภาพรวม อ่าน topic sentence และคำสำคัญ ใช้กับคำถาม matching headings",
      "Scanning: กวาดตาหาข้อมูลเฉพาะ เช่น ตัวเลข ปี ชื่อเฉพาะ (ตัวพิมพ์ใหญ่) ไม่ต้องอ่านทุกคำ",
      "Matching headings: หัวข้อจะเป็น paraphrase ของใจความหลัก ระวังหัวข้อที่มีคำเหมือนในย่อหน้า แต่พูดถึงรายละเอียดเล็ก ๆ ไม่ใช่ใจความหลัก",
    ],
    examples: [
      { en: "Paragraph: 'Rapid growth brings serious challenges…' → Heading: 'Problems caused by fast growth'", th: "challenges = problems, rapid = fast" },
    ],
    guided: [
      mcq("g1", "To find '2050' in a passage, you should…", ["read every word carefully", "scan for the number", "read only the last paragraph"], "scan for the number", "scanning หาตัวเลข", "scanning"),
      mcq("g2", "A heading usually matches…", ["one small detail", "the main idea of the paragraph", "the first word"], "the main idea of the paragraph", "หัวข้อ = ใจความหลัก", "matching-headings"),
    ],
    independent: { th: "ทำ Reading R3 'How Cities Are Changing' ลองเปิดโหมดจับเวลา 15 นาที", link: { href: "/reading/R3", label: "เปิด Reading R3" } },
    checkingTh: "ดูความแม่นยำแยกตามประเภทคำถาม (matching headings vs scanning) ในหน้าความก้าวหน้า",
    mistakeReviewTh: ["เลือกหัวข้อเพราะมีคำซ้ำกับย่อหน้า", "อ่านทุกคำตอน scanning จนหมดเวลา"],
  },
  {
    id: "d19", day: 19, week: 3, area: "speaking",
    title: "Comparing in speaking",
    objective: "Compare places and times naturally in Parts 1 and 3.",
    objectiveTh: "พูดเปรียบเทียบสถานที่และช่วงเวลาอย่างเป็นธรรมชาติ (Part 1 และ Part 3 เบื้องต้น)",
    segments: STD(10, 35, 15),
    explanationTh: [
      "Part 3 (4–5 นาที) ถามคำถามกว้างและเป็นนามธรรมมากขึ้น เช่น 'How has technology changed communication?' ต้องตอบโดยพูดถึงคนทั่วไป ไม่ใช่แค่ตัวเอง",
      "โครงสร้างที่ใช้ได้: In the past, people used to…, but nowadays… / Compared to…, … is much more… / One big difference is that…",
      "ให้เหตุผลและผลกระทบ: This means that… / As a result, …",
    ],
    examples: [
      { en: "In the past, people used to write letters, but nowadays most people send messages instantly. As a result, communication is much faster, although perhaps less personal.", th: "เปรียบเทียบอดีต-ปัจจุบัน + ผลลัพธ์" },
    ],
    guided: [
      mcq("g1", "Choose the natural phrase for past habits:", ["People used to write letters.", "People were used to write letters.", "People use to wrote letters."], "People used to write letters.", "used to + V1 = เคยทำเป็นประจำในอดีต"),
      mcq("g2", "Part 3 answers should…", ["only talk about yourself", "discuss people or society in general with reasons", "be one word"], "discuss people or society in general with reasons", "Part 3 เป็นคำถามระดับสังคม"),
    ],
    independent: { th: "ตอบ Part 1 'Technology' 2 คำถาม และ Part 3 จาก cue card 'technology device' 2 คำถาม บันทึกเสียงและลองพูดซ้ำหลังดู feedback", link: { href: "/speaking?part=3&card=tech-device", label: "เปิด Speaking Part 3" } },
    checkingTh: "ใช้ checklist และ transcript (ถ้ามี) หาจุดที่ใช้ comparatives ถูก/ผิด",
    mistakeReviewTh: ["used to + Ving ✗", "more easier ✗", "ตอบ Part 3 สั้นเกินไป"],
  },
  {
    id: "d20", day: 20, week: 3, area: "vocab",
    title: "Technology words & pronunciation",
    objective: "Learn 8 technology words and practise -tion/-ity stress.",
    objectiveTh: "เรียนคำศัพท์เทคโนโลยี 8 คำ และฝึกเสียงเน้นของคำลงท้าย -tion / -ity",
    segments: STD(15, 30, 15),
    explanationTh: [
      "กฎช่วยจำ: คำลงท้าย -tion / -sion เน้นพยางค์ก่อน -tion เสมอ: inforMAtion, communiCAtion, eduCAtion",
      "คำลงท้าย -ity เน้นพยางค์ก่อน -ity: elecTRIcity, uniVERsity, aBIlity",
      "คำศัพท์เทคโนโลยีใช้ได้ทั้ง Speaking Part 1/3 และ Writing Task 2 หัวข้อเทคโนโลยี",
    ],
    examples: [
      { en: "device / access / convenient / rely on / innovation / addiction / privacy / automation", th: "อุปกรณ์ / เข้าถึง / สะดวก / พึ่งพา / นวัตกรรม / การเสพติด / ความเป็นส่วนตัว / ระบบอัตโนมัติ" },
    ],
    guided: [
      mcq("g1", "Stress in 'communication':", ["COM-mu-ni-ca-tion", "com-mu-ni-CA-tion", "com-MU-ni-ca-tion"], "com-mu-ni-CA-tion", "-tion → เน้นพยางค์ก่อนหน้า", "vocabulary"),
      mcq("g2", "Many people ______ their phones for everything.", ["rely on", "rely in", "rely"], "rely on", "rely on = พึ่งพา", "vocabulary"),
      mcq("g3", "Online banking is very ______ because you can use it at any time.", ["convenient", "convenience", "conveniently"], "convenient", "ต้องการ adjective หลัง very", "vocabulary"),
      gap("g4", "Noun form of 'private': ______", ["privacy"], "private → privacy", "vocabulary"),
    ],
    independent: { th: "เพิ่มคำศัพท์ในบทนี้ลงสมุด แล้วพูดประโยคตัวอย่างของคุณเองคำละ 1 ประโยค (บันทึกเสียงในหน้า Speaking ได้)", link: { href: "/vocabulary", label: "เปิดสมุดคำศัพท์" } },
    checkingTh: "ตรวจการออกเสียงกับพจนานุกรมออนไลน์ (ดูหน้าแหล่งเรียนรู้) และตรวจ word form (noun/adjective) ในประโยค",
    mistakeReviewTh: ["convenience (noun) ใช้แทน convenient (adj)", "rely in → rely on"],
    vocab: [
      { en: "device", th: "อุปกรณ์", example: "Most students own at least two devices.", ipa: "/dɪˈvaɪs/", topic: "Technology", level: "B1" },
      { en: "rely on", th: "พึ่งพา", example: "We rely on our phones too much.", topic: "Technology", level: "B1" },
      { en: "convenient", th: "สะดวก", example: "Online shopping is convenient.", ipa: "/kənˈviː.ni.ənt/", topic: "Technology", level: "B1" },
      { en: "privacy", th: "ความเป็นส่วนตัว", example: "Social media can threaten our privacy.", ipa: "/ˈprɪv.ə.si/", topic: "Technology", level: "B2" },
      { en: "innovation", th: "นวัตกรรม", example: "Innovation changes how we work.", ipa: "/ˌɪn.əˈveɪ.ʃən/", topic: "Technology", level: "B2" },
      { en: "access", th: "การเข้าถึง; เข้าถึง", example: "Not everyone has access to fast internet.", ipa: "/ˈæk.ses/", topic: "Technology", level: "B1" },
    ],
  },
  {
    id: "d21", day: 21, week: 3, area: "review",
    title: "Week 3 review",
    objective: "Review comparisons, numbers and Task 1 language.",
    objectiveTh: "ทบทวนสัปดาห์ที่ 3: การเปรียบเทียบ ตัวเลข และภาษาสำหรับ Task 1",
    segments: [
      { label: "ทบทวนคำศัพท์ที่ถึงกำหนด", minutes: 15 },
      { label: "แบบทดสอบท้ายสัปดาห์", minutes: 20 },
      { label: "ฝึกจากสมุดข้อผิดพลาด", minutes: 20 },
      { label: "สะท้อนการเรียน", minutes: 5 },
    ],
    explanationTh: ["สัปดาห์นี้มีภาษาสำหรับข้อมูลตัวเลขเยอะ ทบทวนให้มั่นใจก่อนเข้าสู่ Task 1 แบบเต็มใน Phase 3"],
    examples: [],
    guided: [
      mcq("g1", "Prices in 2025 were ______ than in 2020.", ["more high", "higher", "highest"], "higher", "high → higher"),
      mcq("g2", "Which is an overview sentence?", ["Overall, online sales grew while store sales declined.", "In 2020, online sales were 12%.", "I prefer shopping online."], "Overall, online sales grew while store sales declined.", "บอกแนวโน้มหลัก ไม่มีตัวเลข"),
      gap("g3", "75% = three ______", ["quarters"], "three quarters"),
      mcq("g4", "Stress in 'electricity':", ["E-lec-tri-ci-ty", "e-lec-TRI-ci-ty"], "e-lec-TRI-ci-ty", "-ity เน้นพยางค์ก่อน", "vocabulary"),
      mcq("g5", "'Thirty' — where is the stress?", ["THIR-ty", "thir-TY"], "THIR-ty", "-ty เน้นพยางค์แรก", "detail"),
      mcq("g6", "Choose the correct phrase:", ["The number of cars rose significantly.", "The number of cars rose significant.", "The number of cars significant rose."], "The number of cars rose significantly.", "ขยายกริยาใช้ adverb (-ly)"),
    ],
    independent: { th: "ทบทวนคำศัพท์ และฝึกจากสมุดข้อผิดพลาด จากนั้นดูหน้าความก้าวหน้าว่าทักษะไหนต่ำสุด", link: { href: "/progress", label: "เปิดหน้าความก้าวหน้า" } },
    checkingTh: "ตรวจอัตโนมัติ ถ้าผิดเรื่องเดิมซ้ำ (เช่น more + -er) ให้ทำแบบฝึกจากข้อผิดพลาดซ้ำวันพรุ่งนี้",
    mistakeReviewTh: ["เขียนสิ่งที่ยังสับสนในช่องบันทึก"],
  },

  // ───────────── WEEK 4: Environment & health — linking, complex sentences, essay preview ─────────────
  {
    id: "d22", day: 22, week: 4, area: "grammar",
    title: "Linking words and relative clauses",
    objective: "Join ideas with because, although, however, therefore, which and who.",
    objectiveTh: "เชื่อมความคิดด้วย because, although, however, therefore และอนุประโยค which/who",
    segments: STD(20, 25, 15),
    explanationTh: [
      "Because / Although เชื่อม 2 อนุประโยคใน 'ประโยคเดียว': Although it was raining, we went out. (ไม่ใช้ but ซ้ำ ✗ Although…, but…)",
      "However / Therefore เชื่อม 2 'ประโยค' ใช้หลังจุดหรือ ; และตามด้วยจุลภาค: Cars are convenient. However, they cause pollution.",
      "Relative clauses ขยายคำนาม: who (คน), which (สิ่งของ), where (สถานที่): Trees, which absorb carbon, are important.",
      "ประโยคซับซ้อน (complex sentences) ช่วยคะแนน Grammatical Range แต่ต้องถูกต้องด้วย ผสมประโยคง่ายและซับซ้อน",
    ],
    examples: [
      { en: "Although recycling is useful, reducing waste is more effective.", th: "Although + อนุประโยค, + อนุประโยคหลัก (ไม่มี but)" },
      { en: "Plastic is cheap. However, it is difficult to recycle.", th: "However หลังจุด + ," },
      { en: "People who exercise regularly sleep better.", th: "who ขยายคน" },
    ],
    guided: [
      mcq("g1", "______ it was expensive, she bought it.", ["Although", "However", "Because"], "Although", "แสดงความขัดแย้งในประโยคเดียว"),
      mcq("g2", "Public transport is cheap. ______, many people still drive.", ["Although", "However", "Because"], "However", "เชื่อม 2 ประโยค แสดงความขัดแย้ง"),
      mcq("g3", "Fewer people drive. ______, air quality has improved.", ["Therefore", "Although", "However"], "Therefore", "แสดงผลลัพธ์"),
      mcq("g4", "The doctor ______ treated me was very kind.", ["which", "who", "where"], "who", "doctor = คน"),
      mcq("g5", "Which sentence is correct?", ["Although it rained, but we played.", "Although it rained, we played.", "Although it rained. We played."], "Although it rained, we played.", "ห้ามใช้ although กับ but ในประโยคเดียวกัน"),
      gap("g6", "The park, ______ opened last year, is very popular. (which/who)", ["which"], "park = สิ่งของ → which"),
    ],
    independent: { th: "เขียน 6 ประโยคเรื่องสิ่งแวดล้อม/สุขภาพ ใช้ although, however, therefore, which, who อย่างละ 1 ครั้งขึ้นไป", link: { href: "/writing?prompt=T2-opinion", label: "เปิดตัวแก้ไข" } },
    checkingTh: "ตรวจเครื่องหมายวรรคตอน: However/Therefore ตามด้วย , / ไม่มี although + but / who กับคน which กับสิ่งของ",
    mistakeReviewTh: ["Although…, but… ✗", "however ใช้เชื่อมกลางประโยคโดยไม่มีจุลภาค", "which กับคน ✗"],
    vocab: [
      { en: "therefore", th: "ดังนั้น", example: "Car use fell; therefore, pollution decreased.", ipa: "/ˈðeə.fɔːr/", topic: "Linking", level: "B2" },
      { en: "although", th: "แม้ว่า", example: "Although it is cheap, it is unhealthy.", ipa: "/ɔːlˈðəʊ/", topic: "Linking", level: "B1" },
    ],
  },
  {
    id: "d23", day: 23, week: 4, area: "listening",
    title: "Listening for the main message",
    objective: "Identify the speaker's main message and supporting points.",
    objectiveTh: "จับใจความหลักของผู้พูดคนเดียว (monologue) และประเด็นสนับสนุน",
    segments: STD(15, 25, 20),
    explanationTh: [
      "การพูดคนเดียว (เหมือน IELTS Part 2 และ 4) มีโครงสร้าง: เปิดหัวข้อ → ประเด็นที่ 1, 2, 3 → สรุป ใจความหลักมักอยู่ตอนต้นและตอนท้าย",
      "คำบอกโครงสร้าง: First, … / Another… / Finally, … / So, my main message is… ช่วยให้รู้ว่ากำลังจะเปลี่ยนประเด็น",
      "ระวังตัวเลือกที่เป็น 'ความเชื่อที่ผู้พูดปฏิเสธ' เช่น 'Many people believe… In fact…' — สิ่งที่คนอื่นเชื่อไม่ใช่ความเห็นของผู้พูด",
    ],
    examples: [
      { en: "Many people believe recycling is complicated. In fact, the biggest problem is…", th: "ความเชื่อแรกถูกปฏิเสธ คำตอบอยู่หลัง In fact" },
    ],
    guided: [
      mcq("g1", "'Some say exercise must be intense. In reality, a daily walk is enough.' The speaker thinks…", ["exercise must be intense", "a daily walk is enough"], "a daily walk is enough", "In reality → ความเห็นของผู้พูด", "main-idea"),
      mcq("g2", "Where is the main message usually found in a talk?", ["Only in the middle", "At the beginning and/or the end", "Never stated"], "At the beginning and/or the end", "บทนำและบทสรุป", "main-idea"),
    ],
    independent: { th: "ทำ Listening L4 'A short talk on recycling at home'", link: { href: "/listening/L4", label: "เปิด Listening L4" } },
    checkingTh: "หลังตรวจ เขียนสรุปใจความหลักของ talk เป็นภาษาอังกฤษ 1 ประโยค เทียบกับประโยคสุดท้ายของสคริปต์",
    mistakeReviewTh: ["เลือกความเชื่อที่ผู้พูดปฏิเสธ", "สับสนรายละเอียดกับใจความหลัก"],
  },
  {
    id: "d24", day: 24, week: 4, area: "reading",
    title: "Vocabulary in context + sentence completion",
    objective: "Guess unknown words from context and complete sentences within the word limit.",
    objectiveTh: "เดาความหมายคำศัพท์จากบริบท และเติมประโยคให้ถูกจำนวนคำ",
    segments: STD(15, 30, 15),
    explanationTh: [
      "เมื่อเจอคำที่ไม่รู้ อย่าหยุดอ่าน ดูบริบท: คำรอบข้าง คำเชื่อม (but, although = ความหมายตรงข้าม) และตัวอย่างที่ตามมา",
      "Sentence completion: (1) อ่านขีดจำกัดคำ (2) หาส่วนของบทความที่ตรงกับประโยค (3) ใช้คำจากบทความ 'ตรงตัว' (4) ตรวจว่าประโยคสมบูรณ์ทางไวยากรณ์",
      "ลำดับคำถามแบบ completion มักเรียงตามลำดับในบทความ",
    ],
    examples: [
      { en: "'The effect is modest compared with reducing traffic.' → modest = not very large", th: "compared with บอกว่าน้อยกว่า" },
    ],
    guided: [
      mcq("g1", "'Despite the heavy rain, the event was a success.' 'Despite' shows…", ["contrast", "result", "time"], "contrast", "despite = แม้ว่า", "vocab-in-context"),
      mcq("g2", "Limit: NO MORE THAN TWO WORDS. Which answer breaks the rule?", ["three years", "for three years", "dust"], "for three years", "3 คำ เกินขีดจำกัด", "sentence-completion"),
    ],
    independent: { th: "ทำ Reading R4 'Why Cities Need Trees' (จับเวลา 15 นาทีถ้าพร้อม)", link: { href: "/reading/R4", label: "เปิด Reading R4" } },
    checkingTh: "ข้อ vocabulary-in-context ที่ผิด ให้เพิ่มคำนั้นลงสมุดคำศัพท์พร้อมประโยคจากบทความ",
    mistakeReviewTh: ["หยุดอ่านเพราะไม่รู้คำศัพท์", "เขียนเกินจำนวนคำ", "เปลี่ยนคำจากบทความ (ต้องใช้คำเดิม)"],
  },
  {
    id: "d25", day: 25, week: 4, area: "writing",
    title: "Task 2 preview: introduction + one body paragraph",
    objective: "Write an opinion introduction and one developed body paragraph (~150 words).",
    objectiveTh: "เขียนบทนำแสดงจุดยืน และ body paragraph 1 ย่อหน้าที่มีเหตุผลและตัวอย่าง (~150 คำ)",
    segments: STD(15, 35, 10),
    explanationTh: [
      "Writing Task 2: เรียงความอย่างน้อย 250 คำใน 40 นาที และมีน้ำหนักคะแนนเป็นสองเท่าของ Task 1 วันนี้ฝึกเพียงส่วนแรก",
      "Introduction 2 ประโยค: (1) paraphrase โจทย์ ด้วยคำของตัวเอง (2) thesis statement บอกจุดยืนชัดเจน เช่น 'I partly agree…'",
      "Body paragraph: Topic sentence (เหตุผลหลัก) → Explanation (อธิบาย) → Example (ตัวอย่าง) → Link back (เชื่อมกลับคำถาม)",
      "ห้ามคัดลอกโจทย์ทั้งประโยค คำที่คัดลอกไม่นับรวมในการประเมินคำศัพท์",
    ],
    examples: [
      { en: "Prompt: Online courses will soon replace classroom learning.\nIntro: It is sometimes claimed that internet-based courses will take the place of traditional classes in the near future. While online learning has clear benefits, I do not believe it will completely replace face-to-face teaching.", th: "paraphrase + thesis" },
    ],
    guided: [
      mcq("g1", "Which is the best paraphrase of 'Online courses will replace classroom learning'?", ["Online courses will replace classroom learning.", "Internet-based courses may take the place of traditional classes.", "Classrooms are good."], "Internet-based courses may take the place of traditional classes.", "ความหมายเดิม คำใหม่"),
      mcq("g2", "A thesis statement should…", ["state your position clearly", "list every idea in detail", "ask the reader a question"], "state your position clearly", "จุดยืนชัดเจน"),
      mcq("g3", "Correct order for a body paragraph:", ["Example → Topic sentence → Explanation", "Topic sentence → Explanation → Example", "Explanation → Example → Topic sentence"], "Topic sentence → Explanation → Example", "TEE structure"),
    ],
    independent: { th: "โจทย์ T2-opinion: เขียน introduction + body paragraph 1 ย่อหน้า (~150 คำ) บันทึกเป็นฉบับแรก", link: { href: "/writing?prompt=T2-opinion", label: "เปิด Task 2 opinion" } },
    checkingTh: "ใช้ checklist Task 2 (เฉพาะข้อที่เกี่ยว) ถ้ามี AI ขอ feedback — AI จะวิเคราะห์ข้อผิดพลาดก่อน และให้ตัวอย่างที่ปรับปรุงหลังจากนั้น งานนี้ยังไม่ครบ 250 คำ จึงไม่ควรประเมิน band",
    mistakeReviewTh: ["คัดลอกโจทย์", "ไม่มีจุดยืน", "body ไม่มีตัวอย่าง"],
  },
  {
    id: "d26", day: 26, week: 4, area: "speaking",
    title: "Full Part 2 (2 minutes) + Part 3",
    objective: "Speak for up to 2 minutes and answer two Part 3 questions.",
    objectiveTh: "พูด Part 2 ให้ได้ใกล้ 2 นาที และตอบ Part 3 สองคำถามพร้อมเหตุผล",
    segments: STD(10, 35, 15),
    explanationTh: [
      "เพิ่มความยาวการพูดด้วยการขยายแต่ละหัวข้อย่อย: บอกรายละเอียด (what/where/when), ความรู้สึก (I feel…), และเรื่องเล่าสั้น ๆ (Once, …)",
      "ถ้าลืมคำ ให้อธิบายแทน (paraphrase): 'the thing you use to…' ดีกว่าหยุดพูด",
      "Part 3: ให้ความเห็น + เหตุผล + ตัวอย่างระดับสังคม + อาจพูดอีกมุมมอง (On the other hand…)",
    ],
    examples: [
      { en: "Once, I went there after a really stressful week, and after just an hour I felt completely different.", th: "เรื่องเล่าสั้นช่วยขยายเวลาอย่างเป็นธรรมชาติ" },
    ],
    guided: [
      mcq("g1", "You forget the word 'umbrella'. Best strategy:", ["Stop and say 'I don't know'", "Say 'the thing you use when it rains'", "Switch to Thai"], "Say 'the thing you use when it rains'", "paraphrase ช่วยรักษาความต่อเนื่อง (fluency)"),
    ],
    independent: { th: "ทำ Part 2 'Describe a place where you like to relax' (เตรียม 1 นาที พูดสูงสุด 2 นาที) แล้วตอบ Part 3 สองคำถาม บันทึกเสียงทั้งหมด", link: { href: "/speaking?part=2&card=relax-place", label: "เปิด Part 2" } },
    checkingTh: "เปรียบเทียบความยาวการพูดกับครั้งแรก (วันที่ 12) ในประวัติการฝึกพูด ถ้ามี AI และ transcript ขอ feedback ได้ — AI จะไม่ประเมินการออกเสียงจากข้อความ",
    mistakeReviewTh: ["พูดไม่ถึง 1 นาทีครึ่ง", "เงียบนานเมื่อลืมคำ"],
  },
  {
    id: "d27", day: 27, week: 4, area: "reading",
    title: "Mixed practice: listening + reading (timed lite)",
    objective: "Complete one listening and one reading exercise with time limits.",
    objectiveTh: "ฝึกผสม Listening + Reading แบบจับเวลาเบา ๆ เพื่อเริ่มคุ้นกับแรงกดดันด้านเวลา",
    segments: [
      { label: "Listening L5 (ฟัง 1 รอบ)", minutes: 20 },
      { label: "Reading R5 (จับเวลา 12 นาที)", minutes: 20 },
      { label: "ตรวจและวิเคราะห์ข้อผิดพลาด", minutes: 20 },
    ],
    explanationTh: [
      "วันนี้เปิดโหมด 'ฟังได้รอบเดียว' ใน Listening และโหมดจับเวลาใน Reading เหมือนสอบจริง แต่ยังสั้นกว่าข้อสอบจริงมาก",
      "ผลวันนี้ไม่ใช่ band score — เป็นการวัดว่าความแม่นยำลดลงเท่าไรเมื่อมีเวลาจำกัด",
    ],
    examples: [],
    guided: [
      mcq("g1", "In the real IELTS Listening test, you hear each recording…", ["once", "twice", "as many times as you like"], "once", "ข้อสอบจริงฟังได้ครั้งเดียว", "detail"),
      mcq("g2", "In IELTS Academic Reading you have…", ["60 minutes for 3 passages", "30 minutes for 3 passages", "unlimited time"], "60 minutes for 3 passages", "60 นาที 3 passages 40 ข้อ (โอนคำตอบในเวลาเดียวกัน)", "detail"),
    ],
    independent: { th: "ทำ L5 (เปิดโหมดฟังรอบเดียว) แล้วทำ R5 (เปิดโหมดจับเวลา)", link: { href: "/listening/L5", label: "เปิด Listening L5" } },
    checkingTh: "เปรียบเทียบความแม่นยำแบบจับเวลากับไม่จับเวลาในหน้าความก้าวหน้า และจัดหมวดข้อผิดพลาดทุกข้อ",
    mistakeReviewTh: ["รีบจนอ่านโจทย์ไม่ครบ", "ใช้เวลากับข้อยากข้อเดียวนานเกินไป"],
  },
  {
    id: "d28", day: 28, week: 4, area: "review",
    title: "Month 1 checkpoint",
    objective: "Review the month, compare with day 1, and choose your focus for weeks 5–8.",
    objectiveTh: "ทบทวนเดือนแรก เทียบกับวันแรก และเลือกจุดเน้นสำหรับสัปดาห์ที่ 5–8",
    segments: [
      { label: "แบบทดสอบรวมเดือนที่ 1", minutes: 20 },
      { label: "เทียบงานเขียน/พูดกับวันแรก", minutes: 15 },
      { label: "ทบทวนคำศัพท์และข้อผิดพลาด", minutes: 20 },
      { label: "วางแผนเดือนถัดไป", minutes: 5 },
    ],
    explanationTh: [
      "เปิดหน้าความก้าวหน้า ดู (1) ความแม่นยำแยกทักษะ (2) ประเภทคำถามที่อ่อนที่สุด (3) หมวดข้อผิดพลาดที่เกิดบ่อยที่สุด",
      "อ่านงานเขียนจากแบบประเมินวันแรก แล้วเปรียบเทียบกับย่อหน้าล่าสุดของคุณ สังเกตความยาว ความถูกต้อง และโครงสร้าง",
      "ยังไม่ต้องเลื่อน Phase — Phase 1 มี 8 สัปดาห์ และจะเลื่อนเมื่อผ่านเกณฑ์เท่านั้น ไม่ใช่เพราะครบเวลา",
    ],
    examples: [],
    guided: [
      mcq("g1", "She ______ in Phuket since she was a child.", ["lives", "has lived", "lived"], "has lived", "since + จุดเวลา → present perfect"),
      mcq("g2", "My new phone is ______ than my old one.", ["more light", "lighter", "lightest"], "lighter", "light → lighter"),
      mcq("g3", "______ the test was difficult, I finished on time.", ["Although", "However", "Because"], "Although", "ความขัดแย้งในประโยคเดียว"),
      mcq("g4", "Passage: 'Most visitors came by car.' Statement: 'No visitors came by bus.'", ["True", "False", "Not Given"], "Not Given", "บทความไม่บอกว่ามีคนมารถบัสหรือไม่ (most by car ไม่ได้แปลว่าไม่มีใครมารถบัส)", "tfng"),
      mcq("g5", "We need to ______ a decision soon.", ["do", "make", "take part"], "make", "make a decision", "vocabulary"),
      mcq("g6", "Which sentence belongs in a Task 1 overview?", ["Overall, sales rose in all three regions.", "Sales rose because people were richer.", "In my opinion, sales are important."], "Overall, sales rose in all three regions.", "ภาพรวมจากข้อมูล ไม่มีเหตุผล/ความเห็น"),
      gap("g7", "Past of 'write': I ______ my first IELTS paragraph this month.", ["wrote"], "write → wrote → written"),
      gap("g8", "The scientist ______ discovered it won a prize. (who/which)", ["who"], "คน → who"),
    ],
    independent: { th: "ดูหน้าความก้าวหน้าและหน้าแผนการเรียน (เกณฑ์ Phase 1) แล้วเขียนเป้าหมาย 3 ข้อสำหรับเดือนหน้าในช่องบันทึกของบทเรียนนี้", link: { href: "/progress", label: "เปิดหน้าความก้าวหน้า" } },
    checkingTh: "แบบทดสอบตรวจอัตโนมัติ สำหรับการเปรียบเทียบงานเขียน ถ้ามี AI สามารถส่งทั้งสองชิ้นไปที่ติวเตอร์ AI พร้อมขอให้ชี้จุดที่พัฒนาและจุดที่ยังผิดซ้ำ",
    mistakeReviewTh: ["เลือกหมวดข้อผิดพลาด 2 หมวดที่พบบ่อยที่สุดเป็นจุดเน้นของเดือนหน้า"],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
